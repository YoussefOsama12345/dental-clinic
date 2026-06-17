import { cn } from '@/lib/utils'

type Tone = 'teal' | 'muted'

const TONES: Record<Tone, React.CSSProperties> = {
  teal: { backgroundColor: 'rgba(4,207,158,0.12)', color: '#067356' },
  muted: { backgroundColor: 'rgba(100,116,139,0.12)', color: '#64748b' },
}

/** Single-hue status pill (teal active / neutral muted). Reused for non-appointment statuses. */
export function Pill({
  tone = 'teal',
  dot: _dot = false,
  className,
  children,
}: {
  tone?: Tone
  dot?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold', className)}
      style={TONES[tone]}
    >
      {children}
    </span>
  )
}
