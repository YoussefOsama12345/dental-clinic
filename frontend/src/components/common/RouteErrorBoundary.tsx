import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

function getErrorMessage(error: unknown) {
  if (isRouteErrorResponse(error)) return error.statusText || error.data?.message || `Error ${error.status}`
  if (error instanceof Error) return error.message
  return 'Something went wrong while loading this page.'
}

export function RouteErrorBoundary() {
  const error = useRouteError()
  const message = getErrorMessage(error)

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-12">
      <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#04CF9E]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-red-500/5 blur-3xl" />

      <section className="relative z-10 mx-auto max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-[#04CF9E]">dentAI</p>
        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          Something went wrong
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          {message}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" className="h-11 rounded-[10px] bg-[#04CF9E] px-5 text-white shadow-sm hover:bg-[#03b589]" onClick={() => window.location.reload()}>
            <RefreshCcw className="me-2 h-4 w-4" />
            Reload page
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-[10px] border-border bg-white/70 px-5 backdrop-blur hover:bg-white">
            <Link to="/">
              <Home className="me-2 h-4 w-4" />
              Back home
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
