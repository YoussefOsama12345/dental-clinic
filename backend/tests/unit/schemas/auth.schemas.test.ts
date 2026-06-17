import { describe, expect, it } from 'vitest'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyResetCodeSchema,
} from '../../../src/modules/auth/auth.schemas'

describe('loginSchema', () => {
  it('accepts a valid email and non-empty password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true)
  })

  it('rejects an invalid email', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email', password: 'x' }).success).toBe(false)
  })

  it('rejects an empty password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false)
  })

  it('rejects missing fields', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com' }).success).toBe(false)
    expect(loginSchema.safeParse({}).success).toBe(false)
  })
})

describe('registerSchema', () => {
  it('accepts a valid registration', () => {
    expect(registerSchema.safeParse({ name: 'Jo', email: 'a@b.com', password: '12345678' }).success).toBe(true)
  })

  it('rejects a name shorter than 2 characters', () => {
    expect(registerSchema.safeParse({ name: 'J', email: 'a@b.com', password: '12345678' }).success).toBe(false)
  })

  it('rejects a password shorter than 8 characters', () => {
    expect(registerSchema.safeParse({ name: 'Jo', email: 'a@b.com', password: '1234567' }).success).toBe(false)
  })

  it('accepts a password of exactly 8 characters (boundary)', () => {
    expect(registerSchema.safeParse({ name: 'Jo', email: 'a@b.com', password: '12345678' }).success).toBe(true)
  })
})

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'a@b.com' }).success).toBe(true)
  })

  it('rejects an invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'bad' }).success).toBe(false)
  })
})

describe('verifyResetCodeSchema', () => {
  it('accepts a 6-character code', () => {
    expect(verifyResetCodeSchema.safeParse({ email: 'a@b.com', code: '123456' }).success).toBe(true)
  })

  it('rejects codes that are not exactly 6 characters', () => {
    expect(verifyResetCodeSchema.safeParse({ email: 'a@b.com', code: '12345' }).success).toBe(false)
    expect(verifyResetCodeSchema.safeParse({ email: 'a@b.com', code: '1234567' }).success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('accepts a valid reset', () => {
    expect(resetPasswordSchema.safeParse({ email: 'a@b.com', code: '123456', password: 'newpass12' }).success).toBe(true)
  })

  it('rejects a short password', () => {
    expect(resetPasswordSchema.safeParse({ email: 'a@b.com', code: '123456', password: 'short' }).success).toBe(false)
  })

  it('rejects a wrong-length code', () => {
    expect(resetPasswordSchema.safeParse({ email: 'a@b.com', code: '12', password: 'newpass12' }).success).toBe(false)
  })
})
