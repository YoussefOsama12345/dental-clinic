import type { TFunction } from 'i18next'
import { z } from 'zod'

export const createResetPasswordSchema = (t: TFunction) => z
  .object({
    password: z
      .string()
      .min(1, t('validation.passwordRequired'))
      .min(8, t('validation.passwordMin', { count: 8 }))
      .max(256)
      .regex(/[A-Z]/, t('validation.passwordUppercase'))
      .regex(/[0-9]/, t('validation.passwordNumber'))
      .regex(/[^A-Za-z0-9]/, t('validation.passwordSpecial')),
    confirmPassword: z.string().min(1, t('validation.confirmPasswordRequired')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t('validation.passwordsDoNotMatch'),
    path: ['confirmPassword'],
  })

export type ResetPasswordFormData = z.infer<ReturnType<typeof createResetPasswordSchema>>
