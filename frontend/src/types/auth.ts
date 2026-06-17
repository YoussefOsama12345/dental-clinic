export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
}

export interface Session {
  user: User
  token: string
  expiresAt: string
}
