import type { TFunction } from 'i18next'
import { z } from 'zod'

export const createRegisterSchema = (t: TFunction) => z
  .object({
    name: z.string().trim().min(1, t('validation.fullNameRequired')).min(2, t('validation.nameMin', { count: 2 })).max(120),
    email: z.string().trim().min(1, t('validation.emailRequired')).email(t('common.invalidEmail')).max(254),
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

export type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>
