import axios, { AxiosError } from 'axios'
import { frontendEnv } from '@/config/env'

export const AUTH_TOKEN_KEY = 'dentai-auth-token'

/**
 * Single axios instance for the whole app.
 *
 * The desktop/frontend app always talks to the backend via a single
 * environment-driven base URL.
 */
export const apiClient = axios.create({
  baseURL: frontendEnv.apiUrl,
  headers: { 'Content-Type': 'application/json' },
})

// Request: inject auth token.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`

  return config
})

const redirectToLogin = () => {
  const loginHash = '#/login'
  if (window.location.hash !== loginHash) {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    window.location.hash = loginHash
  }
}

// Response: on 401, drop the token and bounce to login (interceptors live
// outside React, so use window.location rather than the router).
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401 && !window.location.hash.startsWith('#/login')) {
      redirectToLogin()
    }
    return Promise.reject(error)
  },
)

/** Helper: unwrap axios response to its data payload. */
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await apiClient.get<T>(url, { params })
  return res.data
}

/** Backend error envelope (see backend error.middleware.ts). */
interface ApiErrorBody {
  code?: string
  message?: string
}

/**
 * Extract a human-readable message from any error thrown by the API layer.
 * The backend always responds with `{ code, message }`, so prefer that;
 * fall back to the axios message, then a caller-provided default.
 */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined
    return body?.message ?? error.message ?? fallback
  }
  if (error instanceof Error) return error.message
  return fallback
}
