import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ComboOption {
  value: string
  label: string
  sublabel?: string
}

interface ComboboxProps {
  options: ComboOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  /** Lets a parent dialog know the dropdown is open (e.g. to swallow Escape). */
  onOpenChange?: (open: boolean) => void
}

const MAX_VISIBLE = 50

/**
 * Searchable select for large option lists (e.g. picking one patient out of
 * hundreds) — a plain dropdown is impractical at that size.
 */
export function Combobox({
  options, value, onChange, placeholder, searchPlaceholder, emptyText, disabled, onOpenChange,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Notify the parent + always reopen with an unfiltered list.
  useEffect(() => {
    onOpenChange?.(open)
    if (!open) setQuery('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const selected = options.find((o) => o.value === value)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    const matches = q
      ? options.filter((o) => `${o.label} ${o.sublabel ?? ''}`.toLowerCase().includes(q))
      : options
    return matches.slice(0, MAX_VISIBLE)
  }, [options, query])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    const timer = setTimeout(() => inputRef.current?.focus(), 30)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
      clearTimeout(timer)
    }
  }, [open])

  const select = (v: string) => {
    onChange(v)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={rootRef} className={cn('relative', open && 'z-[80]')}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between rounded-xl bg-[#f8fafc] px-4 py-2 text-sm ring-1 ring-[#e2e8f0] transition-all focus:outline-none focus:ring-[#04CF9E]/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={cn('truncate text-start', !selected && 'text-[#94a3b8]')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-[#94a3b8]" />
      </button>

      {open && (
        <div className="absolute z-[90] mt-1 w-full overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                // Enter must pick the top match — never submit the host form.
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (filtered.length > 0) select(filtered[0].value)
                }
              }}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">{emptyText}</p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => select(o.value)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors hover:bg-[#f1f5f9]"
                >
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                    {o.value === value && <Check className="h-4 w-4 text-[#04CF9E]" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">{o.label}</span>
                    {o.sublabel && <span className="block truncate text-xs text-muted-foreground">{o.sublabel}</span>}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
