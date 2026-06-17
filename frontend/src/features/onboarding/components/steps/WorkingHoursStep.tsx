import { useNavigate } from 'react-router'
import { ChevronLeft, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { OnboardingProgress } from '../OnboardingProgress'
import { useOnboardingStore } from '../../store/onboarding.store'
import type { WorkingHoursDay } from '../../types/onboarding.types'
import { cn } from '@/lib/utils'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const timeCls =
  'h-10 rounded-[8px] bg-[#f3f0ef] px-3 text-[14px] font-medium text-[#2f2e2e] focus:outline-none focus:ring-2 focus:ring-[#04CF9E]/30 transition-all w-[110px]'

export function WorkingHoursStep() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data, setField } = useOnboardingStore()
  const hours = data.workingHours

  const update = (day: string, patch: Partial<WorkingHoursDay>) => {
    setField('workingHours', { ...hours, [day]: { ...hours[day], ...patch } })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Progress */}
      <div className="border-b border-[#eae7e7] px-10 py-6">
        <OnboardingProgress currentStep={4} totalSteps={5} />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-10 py-10">
        <div className="w-full max-w-[640px]">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10 text-center"
          >
            <h1 className="text-[48px] font-extrabold tracking-[-1.2px] text-[#2f2e2e]">
              {t('onboarding.workingHours.title')}{' '}
              <span className="text-[#04CF9E]">{t('onboarding.workingHours.titleHighlight')}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-[480px] text-[18px] text-[#5c5b5b]">
              {t('onboarding.workingHours.subtitle')}
            </p>
          </motion.div>

          {/* Days */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col gap-3"
          >
            {DAYS.map((day, idx) => {
              const dayData = hours[day]
              return (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + idx * 0.04 }}
                  className={cn(
                    'flex items-center gap-4 rounded-[12px] px-5 py-4 transition-all duration-200',
                    dayData.enabled
                      ? 'bg-white border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                      : 'bg-[#f9f9f9] border border-transparent'
                  )}
                >
                  {/* Toggle */}
                  <button
                    type="button"
                    onClick={() => update(day, { enabled: !dayData.enabled })}
                    className={cn(
                      'relative flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200',
                      dayData.enabled ? 'bg-[#04CF9E]' : 'bg-[#d1d5db]'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
                        dayData.enabled ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>

                  {/* Day name */}
                  <span className={cn(
                    'w-28 text-[14px] font-semibold',
                    dayData.enabled ? 'text-[#2f2e2e]' : 'text-[#9ca3af]'
                  )}>
                    {t(`onboarding.workingHours.days.${day}`)}
                  </span>

                  {/* Time inputs or Closed badge */}
                  {dayData.enabled ? (
                    <div className="flex items-center gap-2 ms-auto">
                      <input
                        type="time"
                        value={dayData.open}
                        onChange={(e) => update(day, { open: e.target.value })}
                        className={timeCls}
                      />
                      <span className="text-[13px] text-[#9ca3af] font-medium">
                        {t('onboarding.workingHours.to')}
                      </span>
                      <input
                        type="time"
                        value={dayData.close}
                        onChange={(e) => update(day, { close: e.target.value })}
                        className={timeCls}
                      />
                    </div>
                  ) : (
                    <span className="ms-auto text-[12px] font-semibold uppercase tracking-[1px] text-[#9ca3af]">
                      {t('onboarding.workingHours.closed')}
                    </span>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#eae7e7] px-10 py-5">
        <button
          type="button"
          onClick={() => navigate('/onboarding/specialty')}
          className="flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[1.4px] text-[#5c5b5b] hover:text-[#2f2e2e] transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-3 w-3" />
          {t('onboarding.previous')}
        </button>
        <button
          type="button"
          onClick={() => navigate('/onboarding/plans')}
          className="flex items-center gap-4 rounded-[12px] px-10 py-4 text-[18px] font-bold text-white transition-all hover:-translate-y-0.5 cursor-pointer bg-gradient-primary-btn"
        >
          <span>{t('onboarding.nextStep')}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
