import { Suspense, useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { router } from './router'
import { Providers } from './providers'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuthStore } from '@/features/auth/store/auth.store'

function LoadingFallback() {
  return null
}

function AppRoutes() {
  const isHydrating = useAuthStore((s) => s.isHydrating)
  const logout = useAuthStore((s) => s.logout)

  // Always start a desktop app session from the login screen.
  useEffect(() => {
    logout()
  }, [logout])

  if (isHydrating) return <LoadingFallback />

  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <AppRoutes />
      </Providers>
    </ErrorBoundary>
  )
}
