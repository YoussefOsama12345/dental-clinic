import { describe, expect, it } from 'vitest'
import {
  dentistCreateSchema,
  dentistParamsSchema,
  dentistQuerySchema,
  dentistUpdateSchema,
} from '../../../src/modules/dentists/dentists.schemas'

describe('dentistParamsSchema', () => {
  it('requires a non-empty id', () => {
    expect(dentistParamsSchema.safeParse({ id: 'x' }).success).toBe(true)
    expect(dentistParamsSchema.safeParse({ id: '' }).success).toBe(false)
  })
})

describe('dentistQuerySchema', () => {
  it('accepts optional filters', () => {
    expect(dentistQuerySchema.safeParse({}).success).toBe(true)
    expect(dentistQuerySchema.safeParse({ search: 'a', specialty: 'ortho', active: 'true' }).success).toBe(true)
  })
})

describe('dentistCreateSchema', () => {
  it('accepts the minimal required field (fullName)', () => {
    expect(dentistCreateSchema.safeParse({ fullName: 'Dr. Sarah' }).success).toBe(true)
  })

  it('rejects a missing or empty fullName', () => {
    expect(dentistCreateSchema.safeParse({}).success).toBe(false)
    expect(dentistCreateSchema.safeParse({ fullName: '' }).success).toBe(false)
  })

  it('coerces yearsExperience and rejects negatives', () => {
    const ok = dentistCreateSchema.safeParse({ fullName: 'X', yearsExperience: '5' })
    expect(ok.success).toBe(true)
    if (ok.success) expect(ok.data.yearsExperience).toBe(5)
    expect(dentistCreateSchema.safeParse({ fullName: 'X', yearsExperience: -1 }).success).toBe(false)
    expect(dentistCreateSchema.safeParse({ fullName: 'X', yearsExperience: 2.5 }).success).toBe(false)
  })

  it('accepts qualifications/workingDays arrays', () => {
    expect(
      dentistCreateSchema.safeParse({ fullName: 'X', qualifications: ['BDS'], workingDays: ['mon', 'tue'] }).success,
    ).toBe(true)
  })

  it('allows nullable optional strings', () => {
    expect(dentistCreateSchema.safeParse({ fullName: 'X', specialty: null, bio: null }).success).toBe(true)
  })
})

describe('dentistUpdateSchema', () => {
  it('allows an empty partial update', () => {
    expect(dentistUpdateSchema.safeParse({}).success).toBe(true)
  })

  it('validates provided fields', () => {
    expect(dentistUpdateSchema.safeParse({ fullName: '' }).success).toBe(false)
  })
})
