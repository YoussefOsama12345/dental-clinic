import { describe, expect, it } from 'vitest'
import { toPatient } from '../../../src/modules/patients/patients.dto'
import type { PatientModel } from '../../../src/modules/patients/patients.model'

const baseRow: PatientModel = {
  id: 'p1',
  firstName: 'John',
  lastName: 'Doe',
  gender: 'male',
  dateOfBirth: '1990-01-01',
  phone: '123',
  email: 'j@d.com',
  address: 'somewhere',
  bloodType: 'O+',
  allergiesJson: '["penicillin"]',
  chronicConditionsJson: '["hypertension"]',
  medicationsJson: '["metformin"]',
  smoker: true,
  medicalNotes: 'note',
  emergencyContactName: 'Jane',
  emergencyContactPhone: '456',
  primaryDentistId: 'd1',
  status: 'active',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-02T00:00:00.000Z',
}

describe('toPatient', () => {
  it('maps all fields and parses JSON array columns', () => {
    const dto = toPatient(baseRow)
    expect(dto.id).toBe('p1')
    expect(dto.allergies).toEqual(['penicillin'])
    expect(dto.chronicConditions).toEqual(['hypertension'])
    expect(dto.medications).toEqual(['metformin'])
    expect(dto.smoker).toBe(true)
    expect(dto.primaryDentistId).toBe('d1')
  })

  it('coerces smoker to a boolean', () => {
    expect(toPatient({ ...baseRow, smoker: false }).smoker).toBe(false)
  })

  it('returns empty arrays for empty JSON columns', () => {
    const dto = toPatient({ ...baseRow, allergiesJson: '[]', chronicConditionsJson: '[]', medicationsJson: '[]' })
    expect(dto.allergies).toEqual([])
    expect(dto.chronicConditions).toEqual([])
    expect(dto.medications).toEqual([])
  })

  it('does not leak removed branchId or insurance fields', () => {
    const dto = toPatient(baseRow) as Record<string, unknown>
    expect('branchId' in dto).toBe(false)
    expect('insuranceProvider' in dto).toBe(false)
    expect('insuranceNumber' in dto).toBe(false)
  })

  it('does not expose the raw *Json columns', () => {
    const dto = toPatient(baseRow) as Record<string, unknown>
    expect('allergiesJson' in dto).toBe(false)
  })
})
