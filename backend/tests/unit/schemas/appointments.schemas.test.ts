import { describe, expect, it } from 'vitest'
import {
  appointmentCreateSchema,
  appointmentParamsSchema,
  appointmentQuerySchema,
  appointmentUpdateSchema,
  availabilityQuerySchema,
} from '../../../src/modules/appointments/appointments.schemas'

describe('appointmentParamsSchema', () => {
  it('requires a non-empty id', () => {
    expect(appointmentParamsSchema.safeParse({ id: 'x' }).success).toBe(true)
    expect(appointmentParamsSchema.safeParse({ id: '' }).success).toBe(false)
  })
})

describe('appointmentQuerySchema', () => {
  it('accepts all-optional filters', () => {
    expect(appointmentQuerySchema.safeParse({}).success).toBe(true)
    expect(
      appointmentQuerySchema.safeParse({ from: 'x', to: 'y', dentistId: 'd', patientId: 'p', status: 'scheduled' })
        .success,
    ).toBe(true)
  })
})

describe('availabilityQuerySchema', () => {
  it('requires dentistId, from, and to', () => {
    expect(availabilityQuerySchema.safeParse({ dentistId: 'd', from: 'a', to: 'b' }).success).toBe(true)
  })

  it('rejects when required fields are missing or empty', () => {
    expect(availabilityQuerySchema.safeParse({ from: 'a', to: 'b' }).success).toBe(false)
    expect(availabilityQuerySchema.safeParse({ dentistId: '', from: 'a', to: 'b' }).success).toBe(false)
    expect(availabilityQuerySchema.safeParse({ dentistId: 'd', from: '', to: 'b' }).success).toBe(false)
  })

  it('accepts an optional excludeAppointmentId', () => {
    expect(
      availabilityQuerySchema.safeParse({ dentistId: 'd', from: 'a', to: 'b', excludeAppointmentId: 'x' }).success,
    ).toBe(true)
  })
})

describe('appointmentCreateSchema', () => {
  const valid = {
    patientId: 'p1',
    dentistId: 'd1',
    startsAt: '2025-01-01T09:00:00.000Z',
    endsAt: '2025-01-01T10:00:00.000Z',
  }

  it('accepts a valid appointment', () => {
    expect(appointmentCreateSchema.safeParse(valid).success).toBe(true)
  })

  it('requires patientId, dentistId, startsAt, and endsAt', () => {
    expect(appointmentCreateSchema.safeParse({ ...valid, patientId: undefined }).success).toBe(false)
    expect(appointmentCreateSchema.safeParse({ ...valid, dentistId: '' }).success).toBe(false)
    expect(appointmentCreateSchema.safeParse({ ...valid, startsAt: '' }).success).toBe(false)
    expect(appointmentCreateSchema.safeParse({ ...valid, endsAt: '' }).success).toBe(false)
  })

  it('accepts optional status, reason, and notes', () => {
    expect(
      appointmentCreateSchema.safeParse({ ...valid, status: 'confirmed', reason: 'checkup', notes: null }).success,
    ).toBe(true)
  })
})

describe('appointmentUpdateSchema', () => {
  it('allows an empty partial update', () => {
    expect(appointmentUpdateSchema.safeParse({}).success).toBe(true)
  })

  it('validates provided fields', () => {
    expect(appointmentUpdateSchema.safeParse({ patientId: '' }).success).toBe(false)
  })
})
