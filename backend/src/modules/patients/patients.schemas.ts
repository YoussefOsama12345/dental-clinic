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

export const patientQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(1000).optional(),
  search: z.string().trim().max(120).optional(),
  status: z.enum(['active', 'inactive', 'archived', 'all']).optional(),
  dentistId: z.string().uuid().optional(),
})

export const patientParamsSchema = z.object({
  id: z.string().uuid(),
})

export const patientCreateSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  gender: z.enum(['male', 'female', 'other', 'unspecified']),
  dateOfBirth: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  ),
  phone: nullableOptionalPhone,
  email: nullableOptionalEmail,
  address: nullableOptionalText,
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional().nullable(),
  allergies: optionalStringArray,
  chronicConditions: optionalStringArray,
  medications: optionalStringArray,
  smoker: z.boolean().optional(),
  medicalNotes: nullableOptionalText,
  emergencyContactName: nullableOptionalText,
  emergencyContactPhone: nullableOptionalPhone,
  primaryDentistId: z.string().uuid().optional().nullable(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
})

export const patientUpdateSchema = patientCreateSchema.partial()
