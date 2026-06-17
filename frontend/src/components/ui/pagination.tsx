import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

function pageWindow(page: number, pages: number): (number | '…')[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
  const wanted = [1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages)
  const sorted = [...new Set(wanted)].sort((a, b) => a - b)
  const out: (number | '…')[] = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) out.push('…')
    out.push(p)
    prev = p
  }
  return out
}

const NAV_BTN =
  'flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40'

/** List pagination: range summary + windowed page buttons. Reused by list pages. */
export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const { t } = useTranslation()
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">{t('common.showingRange', { from, to, total })}</p>
      {pages > 1 && (
        <div className="flex items-center gap-1">
          <button type="button" className={NAV_BTN} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </button>
          {pageWindow(page, pages).map((p, i) =>
            p === '…' ? (
              <span key={`gap-${i}`} className="px-1 text-xs text-muted-foreground">…</span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  'h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition-colors',
                  p === page
                    ? 'bg-[#04CF9E] text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {p}
              </button>
            ),
          )}
          <button type="button" className={NAV_BTN} disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      )}
    </div>
  )
}
