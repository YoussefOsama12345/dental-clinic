import { Link } from 'react-router'
import type { LucideIcon } from 'lucide-react'

interface InfoRowProps {
  icon: LucideIcon
  label: string
  value?: string | null
  /** When set (and value exists) the value renders as an internal link. */
  href?: string
}

/** Label/value row used inside profile info cards. */
export function InfoRow({ icon: Icon, label, value, href }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 py-2.5 last:border-0">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 text-[#04CF9E]" />
        {label}
      </span>
      {href && value ? (
        <Link to={href} className="truncate text-sm font-semibold text-[#04A47E] hover:underline">
          {value}
        </Link>
      ) : (
        <span className="truncate text-sm font-medium text-foreground">{value || '—'}</span>
      )}
    </div>
  )
}
