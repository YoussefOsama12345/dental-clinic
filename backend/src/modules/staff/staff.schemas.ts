import { z } from 'zod'

const nullableOptionalEmail = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().trim().email().max(254).optional().nullable(),
)
const nullableOptionalPhone = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().trim().regex(/^[+\d()\-\s.]*$/).max(40).optional().nullable(),
)
const optionalStringArray = z.array(z.string().trim().min(1).max(120)).max(50).optional()
const optionalTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional().nullable()

export const staffParamsSchema = z.object({ id: z.string().uuid() })
export const staffQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  role: z.enum(['reception', 'nurse', 'assistant', 'manager', 'accountant', 'other']).optional(),
  active: z.enum(['true', 'false']).optional(),
})
export const staffCreateSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  role: z.enum(['reception', 'nurse', 'assistant', 'manager', 'accountant', 'other']),
  phone: nullableOptionalPhone,
  email: nullableOptionalEmail,
  status: z.enum(['active', 'on_leave', 'inactive']).optional(),
  workingDays: optionalStringArray,
  workStart: optionalTime,
  workEnd: optionalTime,
})
export const staffUpdateSchema = staffCreateSchema.partial()
