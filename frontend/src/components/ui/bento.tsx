import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Bento layout primitives. `BentoGrid` is a 12-column responsive grid; pass
 * responsive `col-span-*` / `row-span-*` classes to each `BentoItem` via its
 * className (kept as static classes so Tailwind doesn't purge them).
 */
export function BentoGrid({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('grid grid-cols-12 gap-4', className)} {...props} />
}

interface BentoItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode
  icon?: LucideIcon
  action?: React.ReactNode
  bodyClassName?: string
}

export function BentoItem({
  title,
  icon: Icon,
  action,
  className,
  bodyClassName,
  children,
  ...props
}: BentoItemProps) {
  const hasHeader = title != null || action != null
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm',
        className,
      )}
      {...props}
    >
      {hasHeader && (
        <div className="flex items-center justify-between gap-2 px-5 pb-3 pt-4">
          <div className="flex items-center gap-2 min-w-0">
            {Icon && <Icon className="h-4 w-4 shrink-0 text-[#04CF9E]" />}
            <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn('flex-1', hasHeader ? 'px-5 pb-5' : 'p-5', bodyClassName)}>{children}</div>
    </div>
  )
}
