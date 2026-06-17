import { z } from 'zod'

const requiredText = z.string().trim().min(1, 'Required')
const optionalEmail = z.string().trim().email('Invalid email').optional().or(z.literal(''))
const optionalPhone = z.string().trim().regex(/^[+\d()\-\s.]*$/, 'Invalid phone').optional().or(z.literal(''))
const optionalTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time').optional().or(z.literal(''))

export const staffSchema = z.object({
  fullName: requiredText.max(120, 'Too long'),
  role: z.enum(['reception', 'nurse', 'assistant', 'manager', 'accountant', 'other']),
  phone: optionalPhone,
  email: optionalEmail,
  status: z.enum(['active', 'on_leave', 'inactive']),
  workingDays: z.string().trim().optional().or(z.literal('')),
  workStart: optionalTime,
  workEnd: optionalTime,
})

export type StaffFormData = z.infer<typeof staffSchema>
