import { describe, expect, it } from 'vitest'
import { toAppointment } from '../../../src/modules/appointments/appointments.dto'
import type { AppointmentModel } from '../../../src/modules/appointments/appointments.model'

const row: AppointmentModel = {
  id: 'a1',
  patientId: 'p1',
  dentistId: 'd1',
  startsAt: '2025-01-01T09:00:00.000Z',
  endsAt: '2025-01-01T10:00:00.000Z',
  status: 'scheduled',
  reason: 'checkup',
  notes: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

describe('toAppointment', () => {
  it('maps all fields straight through', () => {
    expect(toAppointment(row)).toEqual({
      id: 'a1',
      patientId: 'p1',
      dentistId: 'd1',
      startsAt: '2025-01-01T09:00:00.000Z',
      endsAt: '2025-01-01T10:00:00.000Z',
      status: 'scheduled',
      reason: 'checkup',
      notes: null,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    })
  })

  it('does not leak a branchId field', () => {
    expect('branchId' in (toAppointment(row) as Record<string, unknown>)).toBe(false)
  })
})
