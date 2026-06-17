import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuthStore } from '@/features/auth/store/auth.store'

/**
 * Gate for the dashboard. Redirects unauthenticated users to /login, preserving
 * where they came from. Auth state is hydrated synchronously from localStorage
 * in the store, so there is no loading flash here.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
