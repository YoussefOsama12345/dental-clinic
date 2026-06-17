import { env } from './env'

export const mailConfig = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: env.SMTP_USER && env.SMTP_PASS
    ? {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      }
    : undefined,
  from: {
    address: env.SMTP_FROM_EMAIL,
    name: env.SMTP_FROM_NAME,
  },
} as const
