import { describe, expect, it } from 'vitest'
import { toAuthResponse, toAuthUser } from '../../../src/modules/auth/auth.dto'
import type { AuthProfileModel } from '../../../src/modules/auth/auth.model'

const user: AuthProfileModel = {
  id: 'u1',
  email: 'admin@dentai.local',
  name: 'Admin',
  avatar: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-02T00:00:00.000Z',
}

describe('toAuthUser', () => {
  it('maps the public user fields', () => {
    const dto = toAuthUser(user)
    expect(dto.id).toBe('u1')
    expect(dto.email).toBe('admin@dentai.local')
    expect(dto.name).toBe('Admin')
    expect(dto.createdAt).toBe('2025-01-01T00:00:00.000Z')
  })

  it('converts a null avatar to undefined', () => {
    expect(toAuthUser(user).avatar).toBeUndefined()
  })

  it('passes through a provided role', () => {
    expect(toAuthUser({ ...user, role: 'authenticated' }).role).toBe('authenticated')
  })

  it('never exposes updatedAt', () => {
    expect('updatedAt' in (toAuthUser(user) as Record<string, unknown>)).toBe(false)
  })
})

describe('toAuthResponse', () => {
  it('wraps the user and token together', () => {
    const res = toAuthResponse(user, 'jwt-token')
    expect(res.token).toBe('jwt-token')
    expect(res.user.id).toBe('u1')
  })
})
