import type { TFunction } from 'i18next'
import { z } from 'zod'

export const createLoginSchema = (t: TFunction) => z.object({
  email: z.string().trim().min(1, t('validation.emailRequired')).email(t('common.invalidEmail')).max(254),
  password: z.string().min(1, t('validation.passwordRequired')).max(256),
})

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>
