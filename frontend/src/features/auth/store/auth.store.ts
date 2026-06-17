import { create } from 'zustand'
import { authService } from '../services/auth.service'
import type { User } from '../types/auth.types'

const TOKEN_KEY = 'dentai-auth-token'
const USER_KEY = 'dentai-auth-user'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  /** True until the boot-time session re-validation completes. */
  isHydrating: boolean
  setUser: (user: User | null) => void
  logout: () => void
  /** Re-validate the persisted token against the backend (GET /auth/me). */
  hydrateSession: () => Promise<void>
}

// Self-hydrate from localStorage so auth state is correct on first render
// (no flash / no guard bounce on hard refresh).
function initialUser(): User | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const raw = localStorage.getItem(USER_KEY)
    if (token && raw) return JSON.parse(raw) as User
  } catch {
    /* ignore */
  }
  return null
}

const seedUser = initialUser()

export const useAuthStore = create<AuthState>((set) => ({
  user: seedUser,
  isAuthenticated: !!seedUser,
  // Only block boot if we have a token to verify; otherwise nothing to do.
  isHydrating: !!localStorage.getItem(TOKEN_KEY),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ user: null, isAuthenticated: false, isHydrating: false })
  },
  hydrateSession: async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      set({ user: null, isAuthenticated: false, isHydrating: false })
      return
    }
    const fresh = await authService.me()
    if (fresh) {
      set({ user: fresh, isAuthenticated: true, isHydrating: false })
    } else {
      // Token missing/expired/rejected — clear stale state.
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      set({ user: null, isAuthenticated: false, isHydrating: false })
    }
  },
}))
