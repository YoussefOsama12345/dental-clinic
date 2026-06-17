import { z } from 'zod'

const email = z.string().trim().email().max(254).toLowerCase()
const otpCode = z.string().trim().regex(/^\d{6}$/)
const strongPassword = z.string().min(8).max(256).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/)

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(256),
})

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email,
  password: strongPassword,
})

export const forgotPasswordSchema = z.object({
  email,
})

export const resendVerificationSchema = z.object({
  email,
})

export const verifyEmailSchema = z.object({
  email,
  code: otpCode,
})

export const verifyResetCodeSchema = z.object({
  email,
  code: otpCode,
})

export const resetPasswordSchema = z.object({
  email,
  code: otpCode,
  password: strongPassword,
})
