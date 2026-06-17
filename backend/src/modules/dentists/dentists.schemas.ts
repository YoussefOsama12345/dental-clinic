import { z } from 'zod'

const nullableOptionalText = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().trim().max(1000).optional().nullable(),
)
const nullableOptionalEmail = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().trim().email().max(254).optional().nullable(),
)
const nullableOptionalPhone = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().trim().regex(/^[+\d()\-\s.]*$/).max(40).optional().nullable(),
)
const optionalStringArray = z.array(z.string().trim().min(1).max(120)).max(50).optional()

export const dentistParamsSchema = z.object({ id: z.string().uuid() })
export const dentistQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  specialty: z.string().trim().max(120).optional(),
  active: z.enum(['true', 'false']).optional(),
})
export const dentistCreateSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  specialty: nullableOptionalText,
  licenseNumber: nullableOptionalText,
  phone: nullableOptionalPhone,
  email: nullableOptionalEmail,
  color: z.string().trim().max(32).optional().nullable(),
  yearsExperience: z.coerce.number().int().nonnegative().max(80).optional().nullable(),
  qualifications: optionalStringArray,
  bio: nullableOptionalText,
  workingDays: optionalStringArray,
  workStart: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional().nullable(),
  workEnd: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional().nullable(),
  isActive: z.boolean().optional(),
})
export const dentistUpdateSchema = dentistCreateSchema.partial()
