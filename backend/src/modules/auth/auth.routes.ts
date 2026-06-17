import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware'
import { loginRateLimit, otpRateLimit, passwordResetRateLimit, registerRateLimit } from '../../middleware/rate-limit.middleware'
import { validate } from '../../middleware/validate.middleware'
import { forgotPasswordHandler, loginHandler, meHandler, registerHandler, resendVerificationHandler, resetPasswordHandler, verifyEmailHandler, verifyResetCodeHandler } from './auth.controller'
import { forgotPasswordSchema, loginSchema, registerSchema, resendVerificationSchema, resetPasswordSchema, verifyEmailSchema, verifyResetCodeSchema } from './auth.schemas'

export const authRouter = Router()

authRouter.post('/login', loginRateLimit, validate({ body: loginSchema }), loginHandler)
authRouter.post('/register', registerRateLimit, validate({ body: registerSchema }), registerHandler)
authRouter.post('/resend-verification', otpRateLimit, validate({ body: resendVerificationSchema }), resendVerificationHandler)
authRouter.post('/verify-email', otpRateLimit, validate({ body: verifyEmailSchema }), verifyEmailHandler)
authRouter.post('/forgot-password', passwordResetRateLimit, validate({ body: forgotPasswordSchema }), forgotPasswordHandler)
authRouter.post('/verify-reset-code', otpRateLimit, validate({ body: verifyResetCodeSchema }), verifyResetCodeHandler)
authRouter.post('/reset-password', passwordResetRateLimit, validate({ body: resetPasswordSchema }), resetPasswordHandler)
authRouter.get('/me', requireAuth, meHandler)
