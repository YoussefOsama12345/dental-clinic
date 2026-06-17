const trimTrailingSlash = (value: string): string => value.replace(/\/$/, '')

export const frontendEnv = {
  apiUrl: trimTrailingSlash(import.meta.env.VITE_API_URL ?? 'http://localhost:4001'),
} as const
