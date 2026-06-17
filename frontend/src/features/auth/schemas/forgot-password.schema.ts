import type { TFunction } from 'i18next'
import { z } from 'zod'

export const createForgotPasswordSchema = (t: TFunction) => z.object({
  email: z.string().trim().min(1, t('validation.emailRequired')).email(t('common.invalidEmail')).max(254),
})

export type ForgotPasswordFormData = z.infer<ReturnType<typeof createForgotPasswordSchema>>
