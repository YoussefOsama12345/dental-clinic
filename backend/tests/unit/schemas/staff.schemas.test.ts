import { describe, expect, it } from 'vitest'
import {
  staffCreateSchema,
  staffParamsSchema,
  staffQuerySchema,
  staffUpdateSchema,
} from '../../../src/modules/staff/staff.schemas'

describe('staffParamsSchema', () => {
  it('requires a non-empty id', () => {
    expect(staffParamsSchema.safeParse({ id: 'x' }).success).toBe(true)
    expect(staffParamsSchema.safeParse({ id: '' }).success).toBe(false)
  })
})

describe('staffQuerySchema', () => {
  it('accepts optional filters', () => {
    expect(staffQuerySchema.safeParse({}).success).toBe(true)
    expect(staffQuerySchema.safeParse({ search: 'a', role: 'nurse', active: 'true' }).success).toBe(true)
  })
})

describe('staffCreateSchema', () => {
  it('requires fullName and role', () => {
    expect(staffCreateSchema.safeParse({ fullName: 'Jane', role: 'reception' }).success).toBe(true)
    expect(staffCreateSchema.safeParse({ fullName: 'Jane' }).success).toBe(false)
    expect(staffCreateSchema.safeParse({ role: 'reception' }).success).toBe(false)
  })

  it('rejects empty fullName or role', () => {
    expect(staffCreateSchema.safeParse({ fullName: '', role: 'reception' }).success).toBe(false)
    expect(staffCreateSchema.safeParse({ fullName: 'Jane', role: '' }).success).toBe(false)
  })

  it('treats status as optional', () => {
    expect(staffCreateSchema.safeParse({ fullName: 'Jane', role: 'nurse' }).success).toBe(true)
    expect(staffCreateSchema.safeParse({ fullName: 'Jane', role: 'nurse', status: 'on_leave' }).success).toBe(true)
  })
})

describe('staffUpdateSchema', () => {
  it('allows an empty partial update', () => {
    expect(staffUpdateSchema.safeParse({}).success).toBe(true)
  })

  it('validates provided fields', () => {
    expect(staffUpdateSchema.safeParse({ role: '' }).success).toBe(false)
  })
})
