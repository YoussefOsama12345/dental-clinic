import { z } from 'zod'

const requiredText = z.string().trim().min(1, 'Required')
const optionalText = z.string().trim().optional().or(z.literal(''))
const optionalEmail = z.string().trim().email('Invalid email').optional().or(z.literal(''))
const optionalPhone = z.string().trim().regex(/^[+\d()\-\s.]*$/, 'Invalid phone').optional().or(z.literal(''))
const optionalDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date').optional().or(z.literal(''))

export const patientSchema = z.object({
  firstName: requiredText.max(80, 'Too long'),
  lastName: requiredText.max(80, 'Too long'),
  gender: z.enum(['male', 'female', 'other', 'unspecified']),
  dateOfBirth: optionalDate,
  phone: optionalPhone,
  email: optionalEmail,
  address: optionalText,
  bloodType: z.enum(['none', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  smoker: z.boolean(),
  allergies: optionalText,
  chronicConditions: optionalText,
  medications: optionalText,
  medicalNotes: optionalText,
  emergencyContactName: optionalText,
  emergencyContactPhone: optionalPhone,
  primaryDentistId: z.string().trim().optional(),
  status: z.enum(['active', 'inactive', 'archived']),
})

export type PatientFormData = z.infer<typeof patientSchema>
