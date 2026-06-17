import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import jwt from 'jsonwebtoken'
import { env } from '../../../src/config/env'
import { login, register } from '../../../src/modules/auth/auth.service'
import { closeDb, db, truncateAll } from '../helpers/db'
import { users } from '../../../src/modules/auth/auth.model'
import { eq } from 'drizzle-orm'

// Verifies the backend actually connects to the self-hosted Supabase GoTrue
// container (docker-compose `auth` service). If GoTrue is not reachable, the
// whole suite is skipped rather than failing — so `npm test` stays green when
// only Postgres is up, while still proving the real connection when the full
// stack is running.

async function gotrueReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${env.SUPABASE_AUTH_URL}/health`)
    return res.ok
  } catch {
    return false
  }
}

const reachable = await gotrueReachable()
const uniqueEmail = `test-${Date.now()}@dentai.local`
const password = 'Password123!'

describe.skipIf(!reachable)('Supabase GoTrue connection (live)', () => {
  beforeAll(() => {
    // eslint-disable-next-line no-console
    console.log(`[supabase] GoTrue reachable at ${env.SUPABASE_AUTH_URL} — running live auth tests`)
  })
  beforeEach(() => truncateAll())
  afterAll(() => closeDb())

  it('registers a brand-new user through GoTrue and mirrors it locally', async () => {
    const result = await register('Test User', uniqueEmail, password)
    expect(result.token).toBeTruthy()
    expect(result.user.email).toBe(uniqueEmail)

    // The user is mirrored into the local users table.
    const [mirrored] = await db.select().from(users).where(eq(users.email, uniqueEmail)).limit(1)
    expect(mirrored).toBeDefined()
    expect(mirrored.id).toBe(result.user.id)
  })

  it('issues a Supabase JWT that the backend can verify with its secret', async () => {
    await register('Token User', `token-${Date.now()}@dentai.local`, password).catch(() => undefined)
    const session = await login(uniqueEmail, password)
    // The token must verify against the shared SUPABASE_JWT_SECRET — this is
    // exactly what requireAuth relies on for every protected route.
    const decoded = jwt.verify(session.token, env.SUPABASE_JWT_SECRET) as { sub: string; email?: string }
    expect(decoded.sub).toBe(session.user.id)
  })

  it('rejects a login with the wrong password', async () => {
    await expect(login(uniqueEmail, 'WrongPassword!')).rejects.toBeTruthy()
  })
})

describe.skipIf(reachable)('Supabase GoTrue connection (skipped — container not running)', () => {
  it('is skipped because GoTrue is not reachable; start docker-compose to run it', () => {
    expect(reachable).toBe(false)
  })
})
