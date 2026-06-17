import '@/i18n'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { type ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        closeButton
        expand
        position="bottom-center"
        toastOptions={{
          classNames: {
            toast: 'dentai-toast',
            success: 'dentai-toast-success',
            error: 'dentai-toast-error',
            title: 'dentai-toast-title',
            description: 'dentai-toast-description',
            closeButton: 'dentai-toast-close',
          },
        }}
      />
    </QueryClientProvider>
  )
}
