import { describe, expect, it } from 'vitest'
import { toStaff } from '../../../src/modules/staff/staff.dto'
import type { StaffModel } from '../../../src/modules/staff/staff.model'

const row: StaffModel = {
  id: 's1',
  fullName: 'Jane Roe',
  role: 'reception',
  phone: '111',
  email: 'jane@c.com',
  status: 'active',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-02T00:00:00.000Z',
}

describe('toStaff', () => {
  it('maps all fields straight through', () => {
    expect(toStaff(row)).toEqual(row)
  })

  it('does not leak a branchId field', () => {
    expect('branchId' in (toStaff(row) as Record<string, unknown>)).toBe(false)
  })
})
