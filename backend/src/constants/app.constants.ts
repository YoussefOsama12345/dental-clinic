export const APP_HEADERS = {
  authorization: 'authorization',
} as const

export const PAGINATION = {
  defaultPage: 1,
  defaultPageSize: 20,
  maxPageSize: 100,
} as const

export const AUTH = {
  tokenExpiry: '7d',
  tokenExpirySeconds: 60 * 60 * 24 * 7,
  passwordResetMinutes: 10,
} as const
