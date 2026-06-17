import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/async-handler'
import { unauthorized } from '../../utils/app-error'
import { createPasswordResetCode, getCurrentUser, login, register, resendEmailVerificationCode, resetPassword, verifyEmailRegistration, verifyPasswordResetCode } from './auth.service'

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await login(req.body.email, req.body.password))
})

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await register(req.body.name, req.body.email, req.body.password))
})

export const forgotPasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await createPasswordResetCode(req.body.email))
})

export const resendVerificationHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await resendEmailVerificationCode(req.body.email))
})

export const verifyEmailHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await verifyEmailRegistration(req.body.email, req.body.code))
})

export const verifyResetCodeHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await verifyPasswordResetCode(req.body.email, req.body.code))
})

export const resetPasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await resetPassword(req.body.email, req.body.code, req.body.password))
})

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) throw unauthorized('Authentication required.')
  res.json(await getCurrentUser(req.auth.sub))
})
