import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary — catches uncaught JS errors and shows a friendly fallback
 * instead of a blank/crashed screen. Wrap critical UI sections with this.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production, send to error tracking (Sentry, etc.)
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </div>
          <div>
            <p className="text-[16px] font-semibold text-[#2f2e2e]">Something went wrong</p>
            <p className="text-sm text-[#94a3b8] mt-1 max-w-xs">
              {this.state.error?.message ?? 'An unexpected error occurred. Please try again.'}
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="flex items-center gap-2 rounded-[10px] bg-[#04CF9E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#03b589] transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
