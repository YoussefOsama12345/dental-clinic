import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-semibold border-0',
        variant === 'default' && 'bg-[#04CF9E]/10 text-[#04CF9E]',
        variant === 'success' && 'bg-emerald-500/10 text-emerald-600',
        variant === 'warning' && 'bg-amber-500/10 text-amber-600',
        variant === 'danger' && 'bg-red-500/10 text-red-600',
        className
      )}
      {...props}
    />
  )
}
