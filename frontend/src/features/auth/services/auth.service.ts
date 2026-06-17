import { apiClient, AUTH_TOKEN_KEY } from '@/lib/api-client'
import type { AuthResponse, AuthUser } from '@/types/api'

const USER_KEY = 'dentai-auth-user'

export interface CodeResponse {
  success: boolean
  email?: string
  debugCode?: string
}

export type PasswordResetResponse = CodeResponse

function persist(data: AuthResponse): void {
  localStorage.setItem(AUTH_TOKEN_KEY, data.token)
  localStorage.setItem(USER_KEY, JSON.stringify(data.user))
}

/**
 * Auth service. Calls the backend `/api/auth/*` endpoints, which proxy
 * Supabase Auth (GoTrue) and mirror the user into the local users table.
 * The token is a Supabase JWT that the backend verifies on protected routes.
 */
export const authService = {
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/login', { email, password })
    persist(data)
    return data
  },
  signUp: async (name: string, email: string, password: string): Promise<CodeResponse> =>
    (await apiClient.post<CodeResponse>('/api/auth/register', { name, email, password })).data,
  signOut: (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
  requestPasswordReset: async (email: string): Promise<PasswordResetResponse> =>
    (await apiClient.post<PasswordResetResponse>('/api/auth/forgot-password', { email })).data,
  resendVerificationCode: async (email: string): Promise<CodeResponse> =>
    (await apiClient.post<CodeResponse>('/api/auth/resend-verification', { email })).data,
  verifyEmail: async (email: string, code: string): Promise<{ success: boolean }> =>
    (await apiClient.post<{ success: boolean }>('/api/auth/verify-email', { email, code })).data,
  verifyResetCode: async (email: string, code: string): Promise<{ success: boolean }> =>
    (await apiClient.post<{ success: boolean }>('/api/auth/verify-reset-code', { email, code })).data,
  resetPassword: async (email: string, code: string, password: string): Promise<{ success: boolean }> =>
    (await apiClient.post<{ success: boolean }>('/api/auth/reset-password', { email, code, password })).data,
  /**
   * Re-validate the current session against the backend. Returns the fresh
   * user (and refreshes the cached copy) or null if the token is missing /
   * rejected. Used on app boot so we never trust a stale localStorage user.
   */
  me: async (): Promise<AuthUser | null> => {
    if (!localStorage.getItem(AUTH_TOKEN_KEY)) return null
    try {
      const { data } = await apiClient.get<AuthUser>('/api/auth/me')
      localStorage.setItem(USER_KEY, JSON.stringify(data))
      return data
    } catch {
      return null
    }
  },
  getToken: (): string | null => localStorage.getItem(AUTH_TOKEN_KEY),
  getStoredUser: (): AuthUser | null => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? (JSON.parse(raw) as AuthUser) : null
    } catch {
      return null
    }
  },
}
