import { Search } from 'lucide-react'
import { Input } from './input'

interface TableCardProps {
  search: string
  onSearch: (v: string) => void
  searchPlaceholder: string
  count?: React.ReactNode
  action?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
}

/** Standard list shell: toolbar (search + count + action) → table → footer. Reused by every list page. */
export function TableCard({ search, onSearch, searchPlaceholder, count, action, footer, children }: TableCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="h-9 rounded-[10px] border-none bg-muted/50 ps-9 text-[13px] focus:ring-[#04CF9E]/30"
          />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {count != null && <span className="hidden text-xs text-muted-foreground sm:inline">{count}</span>}
          {action}
        </div>
      </div>
      <div className="overflow-x-auto">{children}</div>
      {footer && <div className="border-t border-border/60 bg-muted/20 px-5 py-3.5">{footer}</div>}
    </div>
  )
}
