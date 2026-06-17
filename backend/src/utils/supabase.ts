import jwt from 'jsonwebtoken'
import { AUTH } from '../constants/app.constants'
import { env } from '../config/env'
import { badRequest, unauthorized } from './app-error'
import type { SupabaseAuthSession, SupabaseSignUpResponse } from '../modules/auth/auth.model'

type SupabaseRole = 'anon' | 'service_role'

function signSupabaseRoleToken(role: SupabaseRole) {
  return jwt.sign(
    { role, aud: env.JWT_AUDIENCE, iss: env.JWT_ISSUER },
    env.SUPABASE_JWT_SECRET,
    { expiresIn: AUTH.tokenExpiry },
  )
}

async function requestSupabaseAuth<T>(path: string, init?: RequestInit, serviceRole = false): Promise<T> {
  const apiKey = signSupabaseRoleToken(serviceRole ? 'service_role' : 'anon')
  const response = await fetch(`${env.SUPABASE_AUTH_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const payload = await response.text()
    console.error(`Supabase Auth ${response.status} on ${path}:`, payload)

    if (response.status === 400 || response.status === 401) {
      throw unauthorized('Invalid email or password.')
    }

    throw badRequest('Authentication request failed. Please try again.')
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const supabaseAuth = {
  signInWithPassword: (email: string, password: string) =>
    requestSupabaseAuth<SupabaseAuthSession>('/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signUpWithPassword: (email: string, password: string, name: string) =>
    requestSupabaseAuth<SupabaseSignUpResponse>('/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, data: { name } }),
    }),

  updateUserPassword: (userId: string, password: string) =>
    requestSupabaseAuth(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    }, true),
}
