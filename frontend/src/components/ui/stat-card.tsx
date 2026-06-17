import { Link } from 'react-router'
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

interface StatCardProps {
  label: string
  value: React.ReactNode
  icon: LucideIcon
  /** Accent hex for the icon chip, e.g. '#04CF9E'. */
  accent?: string
  /** Signed change vs a previous period; null hides the delta. */
  delta?: number | null
  deltaLabel?: string
  /** When false, an increase is rendered as bad (e.g. cancellations). */
  goodWhenUp?: boolean
  /** Optional progress meter, e.g. completed of total. */
  progress?: { done: number; total: number }
  footer?: React.ReactNode
  href?: string
  loading?: boolean
  className?: string
}

const ACCENT = '#04CF9E'

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = ACCENT,
  delta = null,
  deltaLabel,
  goodWhenUp = true,
  progress,
  footer,
  href,
  loading,
  className,
}: StatCardProps) {
  const body = (
    <div
      className={cn(
        'group flex h-full flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all',
        href && 'cursor-pointer hover:border-[#04CF9E]/40 hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <div className="text-[28px] font-bold leading-none tracking-tight text-foreground">{value}</div>
      )}

      {progress && !loading && (
        <div className="mt-auto space-y-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress.total ? Math.round((progress.done / progress.total) * 100) : 0}%`,
                backgroundColor: accent,
              }}
            />
          </div>
        </div>
      )}

      {delta != null && !loading && (
        <div className="mt-auto flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 font-semibold',
              delta === 0
                ? 'text-muted-foreground'
                : (delta > 0) === goodWhenUp
                  ? 'text-[#03B589]'
                  : 'text-slate-500',
            )}
          >
            {delta > 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : delta < 0 ? (
              <ArrowDownRight className="h-3.5 w-3.5" />
            ) : null}
            {delta > 0 ? '+' : ''}
            {delta}
          </span>
          {deltaLabel && <span className="text-muted-foreground">{deltaLabel}</span>}
        </div>
      )}

      {footer && !loading && <div className="mt-auto text-xs text-muted-foreground">{footer}</div>}
    </div>
  )

  return href ? (
    <Link to={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  )
}
