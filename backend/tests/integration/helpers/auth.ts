import jwt from 'jsonwebtoken'
import { env } from '../../../src/config/env'

/**
 * Sign a JWT the same way the backend's requireAuth middleware expects to
 * verify it (same secret). This lets integration tests exercise protected
 * routes without standing up GoTrue — the dedicated Supabase connection test
 * covers the real token issuance path separately.
 */
export function signTestToken(
  overrides: { sub?: string; email?: string; role?: string } = {},
): string {
  return jwt.sign(
    {
      sub: overrides.sub ?? '00000000-0000-0000-0000-000000000001',
      email: overrides.email ?? 'tester@dentai.local',
      role: overrides.role ?? 'authenticated',
    },
    env.SUPABASE_JWT_SECRET,
    { expiresIn: '1h' },
  )
}

export const authHeader = (token = signTestToken()) => ({ Authorization: `Bearer ${token}` })
