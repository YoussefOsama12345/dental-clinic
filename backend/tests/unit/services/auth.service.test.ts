import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the Supabase GoTrue HTTP layer — no real network in unit tests.
vi.mock('../../../src/modules/auth/auth.supabase', () => ({
  signInWithPassword: vi.fn(),
  signUpWithPassword: vi.fn(),
  updateSupabaseUserPassword: vi.fn(),
}))

vi.mock('../../../src/modules/auth/auth.repository', () => ({
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  createUser: vi.fn(),
  clearResetCodes: vi.fn(),
  createResetCode: vi.fn(),
  findValidResetCode: vi.fn(),
  markResetCodeUsed: vi.fn(),
}))

vi.mock('../../../src/services/mail.service', () => ({
  sendWelcomeEmail: vi.fn(),
  sendPasswordResetCodeEmail: vi.fn(),
  sendPasswordChangedEmail: vi.fn(),
}))

import * as supabase from '../../../src/modules/auth/auth.supabase'
import * as repo from '../../../src/modules/auth/auth.repository'
import * as mail from '../../../src/services/mail.service'
import {
  createPasswordResetCode,
  getCurrentUser,
  login,
  register,
  resetPassword,
  verifyPasswordResetCode,
} from '../../../src/modules/auth/auth.service'

const dbUser = {
  id: 'u1',
  email: 'admin@dentai.local',
  name: 'Admin',
  avatar: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

const session = {
  access_token: 'jwt-token',
  user: { id: 'u1', email: 'admin@dentai.local', user_metadata: { name: 'Admin' } },
}

beforeEach(() => vi.clearAllMocks())

describe('login', () => {
  it('returns a token + user for an existing mirrored user', async () => {
    vi.mocked(supabase.signInWithPassword).mockResolvedValue(session as never)
    vi.mocked(repo.findUserById).mockResolvedValue(dbUser as never)

    const result = await login('Admin@Dentai.Local', 'pw')
    expect(result.token).toBe('jwt-token')
    expect(result.user.id).toBe('u1')
    // Email is normalized to lowercase before hitting Supabase.
    expect(supabase.signInWithPassword).toHaveBeenCalledWith('admin@dentai.local', 'pw')
  })

  it('mirrors the Supabase user into the local table on first login', async () => {
    vi.mocked(supabase.signInWithPassword).mockResolvedValue(session as never)
    vi.mocked(repo.findUserById).mockResolvedValue(null as never)
    vi.mocked(repo.createUser).mockResolvedValue(dbUser as never)

    await login('admin@dentai.local', 'pw')
    expect(repo.createUser).toHaveBeenCalledOnce()
  })

  it('propagates Supabase auth failures', async () => {
    vi.mocked(supabase.signInWithPassword).mockRejectedValue(new Error('bad creds'))
    await expect(login('admin@dentai.local', 'wrong')).rejects.toThrow()
  })
})

describe('register', () => {
  it('rejects with 409 when the email already exists', async () => {
    vi.mocked(repo.findUserByEmail).mockResolvedValue(dbUser as never)
    await expect(register('Admin', 'admin@dentai.local', 'password1')).rejects.toMatchObject({ statusCode: 409 })
    expect(supabase.signUpWithPassword).not.toHaveBeenCalled()
  })

  it('signs up, logs in, and sends a welcome email', async () => {
    vi.mocked(repo.findUserByEmail).mockResolvedValue(null as never)
    vi.mocked(supabase.signUpWithPassword).mockResolvedValue({} as never)
    vi.mocked(supabase.signInWithPassword).mockResolvedValue(session as never)
    vi.mocked(repo.findUserById).mockResolvedValue(dbUser as never)

    const result = await register('Admin', 'admin@dentai.local', 'password1')
    expect(result.token).toBe('jwt-token')
    expect(mail.sendWelcomeEmail).toHaveBeenCalledOnce()
  })
})

describe('getCurrentUser', () => {
  it('returns the user profile when found', async () => {
    vi.mocked(repo.findUserById).mockResolvedValue(dbUser as never)
    expect((await getCurrentUser('u1')).email).toBe('admin@dentai.local')
  })

  it('throws 401 when the profile is missing', async () => {
    vi.mocked(repo.findUserById).mockResolvedValue(null as never)
    await expect(getCurrentUser('ghost')).rejects.toMatchObject({ statusCode: 401 })
  })
})

describe('createPasswordResetCode', () => {
  it('silently succeeds for an unknown email (no account enumeration)', async () => {
    vi.mocked(repo.findUserByEmail).mockResolvedValue(null as never)
    const result = await createPasswordResetCode('nobody@x.com')
    expect(result).toEqual({ success: true })
    expect(repo.createResetCode).not.toHaveBeenCalled()
    expect(mail.sendPasswordResetCodeEmail).not.toHaveBeenCalled()
  })

  it('creates a code and emails it for a known user', async () => {
    vi.mocked(repo.findUserByEmail).mockResolvedValue(dbUser as never)
    const result = await createPasswordResetCode('admin@dentai.local')
    expect(repo.clearResetCodes).toHaveBeenCalledWith('u1')
    expect(repo.createResetCode).toHaveBeenCalledOnce()
    expect(mail.sendPasswordResetCodeEmail).toHaveBeenCalledOnce()
    expect(result.success).toBe(true)
    // NODE_ENV=test is not development, so no debugCode is leaked.
    expect('debugCode' in result).toBe(false)
  })
})

describe('verifyPasswordResetCode', () => {
  it('throws 400 for an unknown email', async () => {
    vi.mocked(repo.findUserByEmail).mockResolvedValue(null as never)
    await expect(verifyPasswordResetCode('x@y.com', '123456')).rejects.toMatchObject({ statusCode: 400 })
  })

  it('throws 400 for an invalid/expired code', async () => {
    vi.mocked(repo.findUserByEmail).mockResolvedValue(dbUser as never)
    vi.mocked(repo.findValidResetCode).mockResolvedValue(null as never)
    await expect(verifyPasswordResetCode('admin@dentai.local', '000000')).rejects.toMatchObject({ statusCode: 400 })
  })

  it('succeeds for a valid code', async () => {
    vi.mocked(repo.findUserByEmail).mockResolvedValue(dbUser as never)
    vi.mocked(repo.findValidResetCode).mockResolvedValue({ id: 'rc1' } as never)
    expect(await verifyPasswordResetCode('admin@dentai.local', '123456')).toEqual({ success: true })
  })
})

describe('resetPassword', () => {
  it('throws 400 when the code is invalid', async () => {
    vi.mocked(repo.findUserByEmail).mockResolvedValue(dbUser as never)
    vi.mocked(repo.findValidResetCode).mockResolvedValue(null as never)
    await expect(resetPassword('admin@dentai.local', '000000', 'newpass12')).rejects.toMatchObject({ statusCode: 400 })
    expect(supabase.updateSupabaseUserPassword).not.toHaveBeenCalled()
  })

  it('updates the password, marks the code used, and emails confirmation', async () => {
    vi.mocked(repo.findUserByEmail).mockResolvedValue(dbUser as never)
    vi.mocked(repo.findValidResetCode).mockResolvedValue({ id: 'rc1' } as never)
    const result = await resetPassword('admin@dentai.local', '123456', 'newpass12')
    expect(supabase.updateSupabaseUserPassword).toHaveBeenCalledWith('u1', 'newpass12')
    expect(repo.markResetCodeUsed).toHaveBeenCalledWith('rc1', expect.any(String))
    expect(mail.sendPasswordChangedEmail).toHaveBeenCalledOnce()
    expect(result).toEqual({ success: true })
  })
})
