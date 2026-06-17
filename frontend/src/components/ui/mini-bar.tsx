import { cn } from '@/lib/utils'

interface MiniBarPoint {
  label: string
  value: number
  highlight?: boolean
}

interface MiniBarChartProps {
  data: MiniBarPoint[]
  accent?: string
  height?: number
  className?: string
}

/** Tiny dependency-free bar chart (CSS). Reused for trends/sparklines. */
export function MiniBarChart({ data, accent = '#04CF9E', height = 96, className }: MiniBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className={cn('flex items-end gap-2', className)} style={{ height }}>
      {data.map((d, i) => {
        const pct = Math.round((d.value / max) * 100)
        return (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground">{d.value}</span>
            <div
              className="w-full rounded-md transition-all duration-500"
              style={{
                height: `${Math.max(pct, 4)}%`,
                backgroundColor: d.highlight ? accent : `${accent}55`,
                minHeight: 4,
              }}
              title={`${d.label}: ${d.value}`}
            />
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}
