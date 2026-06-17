import { cn } from '@/lib/utils'

export function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface PersonCellProps {
  name: string
  subtitle?: string | null
  /** Accent hex for the initials avatar; defaults to brand teal. */
  color?: string | null
  className?: string
}

/** Initials avatar + name + optional subtitle. Reused across people lists. */
export function PersonCell({ name, subtitle, color, className }: PersonCellProps) {
  const accent = color || '#04CF9E'
  return (
    <div className={cn('flex items-center gap-3 min-w-0', className)}>
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
        style={{ backgroundColor: `${accent}1F`, color: accent }}
      >
        {initialsOf(name)}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{name}</p>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  )
}
