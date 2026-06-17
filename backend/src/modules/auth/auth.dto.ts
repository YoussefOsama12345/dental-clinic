import type { AuthProfileModel } from './auth.model'

export const toAuthUser = (user: AuthProfileModel & { role?: string }) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  avatar: user.avatar ?? undefined,
  role: user.role,
  createdAt: user.createdAt,
})

export const toAuthResponse = (user: AuthProfileModel & { role?: string }, token: string) => ({
  token,
  user: toAuthUser(user),
})
