import { describe, expect, it } from 'vitest'
import {
  patientCreateSchema,
  patientParamsSchema,
  patientQuerySchema,
  patientUpdateSchema,
} from '../../../src/modules/patients/patients.schemas'

describe('patientQuerySchema', () => {
  it('coerces string page/pageSize to numbers', () => {
    const result = patientQuerySchema.safeParse({ page: '2', pageSize: '50' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(2)
      expect(result.data.pageSize).toBe(50)
    }
  })

  it('rejects non-positive page values', () => {
    expect(patientQuerySchema.safeParse({ page: '0' }).success).toBe(false)
    expect(patientQuerySchema.safeParse({ page: '-1' }).success).toBe(false)
  })

  it('allows an empty query (all optional)', () => {
    expect(patientQuerySchema.safeParse({}).success).toBe(true)
  })

  it('passes through search/status/dentistId filters', () => {
    const result = patientQuerySchema.safeParse({ search: 'john', status: 'active', dentistId: 'd1' })
    expect(result.success).toBe(true)
  })
})

describe('patientParamsSchema', () => {
  it('requires a non-empty id', () => {
    expect(patientParamsSchema.safeParse({ id: 'abc' }).success).toBe(true)
    expect(patientParamsSchema.safeParse({ id: '' }).success).toBe(false)
  })
})

describe('patientCreateSchema', () => {
  const valid = { firstName: 'John', lastName: 'Doe', gender: 'male' }

  it('accepts the minimal required fields', () => {
    expect(patientCreateSchema.safeParse(valid).success).toBe(true)
  })

  it('requires firstName, lastName, and gender', () => {
    expect(patientCreateSchema.safeParse({ lastName: 'Doe', gender: 'male' }).success).toBe(false)
    expect(patientCreateSchema.safeParse({ firstName: 'John', gender: 'male' }).success).toBe(false)
    expect(patientCreateSchema.safeParse({ firstName: 'John', lastName: 'Doe' }).success).toBe(false)
  })

  it('rejects empty required strings', () => {
    expect(patientCreateSchema.safeParse({ ...valid, firstName: '' }).success).toBe(false)
  })

  it('accepts array medical fields', () => {
    const result = patientCreateSchema.safeParse({
      ...valid,
      allergies: ['penicillin'],
      chronicConditions: ['hypertension'],
      medications: ['metformin'],
      smoker: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects non-array allergies', () => {
    expect(patientCreateSchema.safeParse({ ...valid, allergies: 'penicillin' }).success).toBe(false)
  })

  it('allows nullable optional strings', () => {
    expect(patientCreateSchema.safeParse({ ...valid, phone: null, email: null }).success).toBe(true)
  })

  it('does NOT accept removed insurance/branch fields as required (extra keys are stripped)', () => {
    const result = patientCreateSchema.safeParse({ ...valid, insuranceProvider: 'X', branchId: 'b1' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect('insuranceProvider' in result.data).toBe(false)
      expect('branchId' in result.data).toBe(false)
    }
  })
})

describe('patientUpdateSchema', () => {
  it('allows partial updates including an empty object', () => {
    expect(patientUpdateSchema.safeParse({}).success).toBe(true)
    expect(patientUpdateSchema.safeParse({ firstName: 'Jane' }).success).toBe(true)
  })

  it('still validates provided fields', () => {
    expect(patientUpdateSchema.safeParse({ firstName: '' }).success).toBe(false)
  })
})
