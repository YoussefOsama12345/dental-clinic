import { z } from 'zod'

const nullableOptionalText = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().trim().max(1000).optional().nullable(),
)
const isoDateTime = z.string().datetime({ offset: true })

export const appointmentParamsSchema = z.object({ id: z.string().uuid() })
export const appointmentQuerySchema = z.object({
  from: isoDateTime.optional(),
  to: isoDateTime.optional(),
  dentistId: z.string().uuid().optional(),
  patientId: z.string().uuid().optional(),
  status: z.enum(['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
})
export const availabilityQuerySchema = z.object({
  dentistId: z.string().uuid(),
  from: isoDateTime,
  to: isoDateTime,
  excludeAppointmentId: z.string().uuid().optional(),
})
export const appointmentCreateSchema = z.object({
  patientId: z.string().uuid(),
  dentistId: z.string().uuid(),
  startsAt: isoDateTime,
  endsAt: isoDateTime,
  status: z.enum(['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
  type: z.enum(['consultation', 'cleaning', 'follow_up', 'emergency', 'treatment']).optional().nullable(),
  room: z.string().trim().max(80).optional().nullable(),
  reason: nullableOptionalText,
  notes: nullableOptionalText,
  cancellationReason: nullableOptionalText,
  outcome: z.enum(['completed_normally', 'needs_follow_up', 'referred', 'treatment_plan_created']).optional().nullable(),
  fee: z.coerce.number().nonnegative().max(1000000).optional().nullable(),
})
export const appointmentUpdateSchema = appointmentCreateSchema.partial()
