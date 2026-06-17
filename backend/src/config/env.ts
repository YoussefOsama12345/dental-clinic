import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4001),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_ISSUER: z.string().min(1).default('dentai-local'),
  JWT_AUDIENCE: z.string().min(1).default('authenticated'),
  AUTH_MODE: z.enum(['supabase']).default('supabase'),
  SUPABASE_AUTH_URL: z.string().url(),
  SUPABASE_JWT_SECRET: z.string().min(32),
  SMTP_HOST: z.string().min(1).default('localhost'),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_SECURE: z.union([z.boolean(), z.string()]).transform((value) => {
    if (typeof value === 'boolean') return value
    return value === 'true'
  }).default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().email().default('no-reply@dentai.local'),
  SMTP_FROM_NAME: z.string().min(1).default('dentAI'),
  CORS_ORIGIN: z.string().optional(),
  TRUST_PROXY: z.coerce.number().int().nonnegative().default(0),
})

const parsed = envSchema.parse(process.env)

export const env = {
  ...parsed,
  isDevelopment: parsed.NODE_ENV === 'development',
  corsOrigins: parsed.CORS_ORIGIN?.split(',').map((value) => value.trim()).filter(Boolean) ?? ['http://localhost:5173'],
} as const
