import { describe, expect, it } from 'vitest'
import { toDentist } from '../../../src/modules/dentists/dentists.dto'
import type { DentistModel } from '../../../src/modules/dentists/dentists.model'

const row: DentistModel = {
  id: 'd1',
  fullName: 'Dr. Sarah',
  specialty: 'Ortho',
  licenseNumber: 'LIC-1',
  phone: '111',
  email: 's@c.com',
  color: '#04CF9E',
  yearsExperience: 8,
  qualificationsJson: '["BDS","MSc"]',
  bio: 'bio',
  workingDaysJson: '["mon","tue"]',
  workStart: '09:00',
  workEnd: '17:00',
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-02T00:00:00.000Z',
}

describe('toDentist', () => {
  it('maps fields and parses JSON arrays', () => {
    const dto = toDentist(row)
    expect(dto.qualifications).toEqual(['BDS', 'MSc'])
    expect(dto.workingDays).toEqual(['mon', 'tue'])
    expect(dto.isActive).toBe(true)
    expect(dto.yearsExperience).toBe(8)
  })

  it('coerces isActive to boolean', () => {
    expect(toDentist({ ...row, isActive: false }).isActive).toBe(false)
  })

  it('does not leak branchId or raw *Json columns', () => {
    const dto = toDentist(row) as Record<string, unknown>
    expect('branchId' in dto).toBe(false)
    expect('qualificationsJson' in dto).toBe(false)
    expect('workingDaysJson' in dto).toBe(false)
  })
})
