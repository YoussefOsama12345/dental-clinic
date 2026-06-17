import { z } from 'zod'

const requiredText = z.string().trim().min(1, 'Required')
const optionalText = z.string().trim().optional().or(z.literal(''))
const optionalEmail = z.string().trim().email('Invalid email').optional().or(z.literal(''))
const optionalPhone = z.string().trim().regex(/^[+\d()\-\s.]*$/, 'Invalid phone').optional().or(z.literal(''))
const optionalTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time').optional().or(z.literal(''))

export const dentistSchema = z.object({
  fullName: requiredText.max(120, 'Too long'),
  specialty: optionalText,
  licenseNumber: optionalText,
  phone: optionalPhone,
  email: optionalEmail,
  yearsExperience: z.string().trim().regex(/^\d*$/, 'Numbers only').optional(),
  qualifications: optionalText,
  bio: optionalText,
  workingDays: optionalText,
  workStart: optionalTime,
  workEnd: optionalTime,
  isActive: z.boolean(),
})

export type DentistFormData = z.infer<typeof dentistSchema>
