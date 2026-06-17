import type { TFunction } from 'i18next'
import { z } from 'zod'

export const createVerifyOtpSchema = (t: TFunction) => z.object({
  otp: z
    .string()
    .trim()
    .length(6, t('validation.otpLength', { count: 6 }))
    .regex(/^\d{6}$/, t('validation.otpDigits')),
})

export type VerifyOtpFormData = z.infer<ReturnType<typeof createVerifyOtpSchema>>
