import rateLimit from 'express-rate-limit'

const commonOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' },
}

export const apiRateLimit = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  max: 400,
})

export const loginRateLimit = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
})

export const registerRateLimit = rateLimit({
  ...commonOptions,
  windowMs: 60 * 60 * 1000,
  max: 8,
})

export const otpRateLimit = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  max: 6,
})

export const passwordResetRateLimit = rateLimit({
  ...commonOptions,
  windowMs: 60 * 60 * 1000,
  max: 5,
})
