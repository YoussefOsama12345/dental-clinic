import { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

interface TabsCtx {
  value: string
  setValue: (v: string) => void
}
const Ctx = createContext<TabsCtx | null>(null)

/** Lightweight controlled/uncontrolled tabs (no extra dependency). Reused by profile pages. */
export function Tabs({
  defaultValue,
  value: controlled,
  onValueChange,
  className,
  children,
}: {
  defaultValue: string
  value?: string
  onValueChange?: (v: string) => void
  className?: string
  children: React.ReactNode
}) {
  const [internal, setInternal] = useState(defaultValue)
  const value = controlled ?? internal
  const setValue = (v: string) => {
    setInternal(v)
    onValueChange?.(v)
  }
  return <Ctx.Provider value={{ value, setValue }}><div className={className}>{children}</div></Ctx.Provider>
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-xl border border-border/60 bg-muted/40 p-1', className)}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(Ctx)!
  const active = ctx.value === value
  return (
    <button
      type="button"
      onClick={() => ctx.setValue(value)}
      className={cn(
        'rounded-lg px-4 py-1.5 text-sm font-medium transition-all',
        active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const ctx = useContext(Ctx)!
  if (ctx.value !== value) return null
  return <div className={className}>{children}</div>
}
