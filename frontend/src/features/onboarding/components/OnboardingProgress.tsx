import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface OnboardingProgressProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export function OnboardingProgress({ currentStep, totalSteps, className }: OnboardingProgressProps) {
  const { t } = useTranslation()
  const pct = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[2px] text-[#5c5b5b]">
          {t('onboarding.progress')}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[2px] text-[#04CF9E]">
          {t('onboarding.stepOf', {
            current: String(currentStep).padStart(2, '0'),
            total: String(totalSteps).padStart(2, '0'),
          })}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-[12px] bg-[#eae7e7]">
        <div
          className="h-full rounded-[12px] transition-all duration-500 bg-gradient-primary-progress"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
