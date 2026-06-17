import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ProfileStatsProps {
  items: { label: string; value: ReactNode }[]
  className?: string
}

/** Compact stats strip shown inside profile header cards. */
export function ProfileStats({ items, className }: ProfileStatsProps) {
  return (
    <div
      className={cn(
        'mt-5 grid gap-3 border-t border-border/40 pt-4',
        items.length === 3 ? 'grid-cols-3' : 'grid-cols-2',
        className,
      )}
    >
      {items.map((s, i) => (
        <div key={i} className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
          <p className="mt-1 truncate text-sm font-bold text-foreground">{s.value}</p>
        </div>
      ))}
    </div>
  )
}
