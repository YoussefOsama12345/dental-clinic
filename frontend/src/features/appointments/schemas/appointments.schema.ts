import { z } from 'zod'

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time')

export const appointmentSchema = z
  .object({
    patientId: z.string().trim().min(1, 'Required'),
    dentistId: z.string().trim().min(1, 'Required'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Required'),
    startTime: timeSchema,
    endTime: timeSchema,
    status: z.enum(['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show']),
    type: z.enum(['consultation', 'cleaning', 'follow_up', 'emergency', 'treatment']).optional().or(z.literal('')),
    room: z.string().trim().max(80, 'Too long').optional().or(z.literal('')),
    reason: z.string().trim().optional().or(z.literal('')),
    notes: z.string().trim().max(1000, 'Too long').optional().or(z.literal('')),
    cancellationReason: z.string().trim().max(1000, 'Too long').optional().or(z.literal('')),
    outcome: z.enum(['completed_normally', 'needs_follow_up', 'referred', 'treatment_plan_created']).optional().or(z.literal('')),
    fee: z.string().trim().regex(/^\d*(\.\d{0,2})?$/, 'Invalid amount').optional().or(z.literal('')),
  })
  .refine((data) => new Date(`${data.date}T${data.endTime}`) > new Date(`${data.date}T${data.startTime}`), {
    message: 'End time must be after start time',
    path: ['endTime'],
  })

export type AppointmentFormData = z.infer<typeof appointmentSchema>
