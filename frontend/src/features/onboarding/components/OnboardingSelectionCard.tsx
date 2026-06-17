import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface OnboardingSelectionCardProps {
  title: string
  description: string
  icon?: LucideIcon
  iconUrl?: string
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

export function OnboardingSelectionCard({
  title,
  description,
  icon: Icon,
  iconUrl,
  isSelected,
  onClick,
  className,
}: OnboardingSelectionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        // h-full so the card fills its grid cell height — all cells in a row are equal by CSS grid default
        'relative flex h-full min-h-[200px] cursor-pointer flex-col items-start gap-4 rounded-[12px] p-6 text-start transition-all duration-200',
        isSelected
          ? 'border-2 border-[#04CF9E] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]'
          : 'border border-transparent bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:border-[#04CF9E]/30 hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)]',
        className
      )}
      type="button"
    >
      {/* Icon — consistent rounded-[10px] background across all onboarding pages */}
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px]',
          isSelected
            ? 'bg-gradient-to-br from-[#04CF9E] to-[#03b589]'
            : 'bg-[rgba(4,207,158,0.1)]'
        )}
      >
        {Icon && (
          <Icon
            className={cn('h-6 w-6', isSelected ? 'text-white' : 'text-[#04CF9E]')}
          />
        )}
        {iconUrl && (
          <img src={iconUrl} alt="" className="h-6 w-6 object-contain" />
        )}
      </div>

      {/* Text */}
      <div className="w-full">
        <p className="text-[18px] font-semibold leading-7 text-[#2f2e2e]">{title}</p>
        <p className="mt-1 text-sm leading-5 text-[#5c5b5b]">{description}</p>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#04CF9E]">
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  )
}
