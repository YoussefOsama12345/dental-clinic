import { useNavigate } from 'react-router'
import { Check, Circle, ChevronLeft, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { OnboardingProgress } from '../OnboardingProgress'
import { useOnboardingStore } from '../../store/onboarding.store'
import { cn } from '@/lib/utils'

type PlanId = 'starter' | 'pro' | 'enterprise'
type CtaStyle = 'gradient' | 'outline-dark'

interface PlanConfig {
  id: PlanId
  hasMonthlyPrice: boolean
  recommended?: boolean
  ctaStyle: CtaStyle
  features: { key: string; included: boolean }[]
}

const plans: PlanConfig[] = [
  {
    id: 'starter',
    hasMonthlyPrice: false,
    ctaStyle: 'outline-dark',
    features: [
      { key: 'dentists', included: true },
      { key: 'records', included: true },
      { key: 'scheduling', included: true },
      { key: 'reminders', included: true },
      { key: 'ai', included: false },
    ],
  },
  {
    id: 'pro',
    hasMonthlyPrice: true,
    recommended: true,
    ctaStyle: 'gradient',
    features: [
      { key: 'dentists', included: true },
      { key: 'records', included: true },
      { key: 'scheduling', included: true },
      { key: 'ai', included: true },
      { key: 'billing', included: true },
      { key: 'reminders', included: true },
      { key: 'support', included: true },
    ],
  },
  {
    id: 'enterprise',
    hasMonthlyPrice: false,
    ctaStyle: 'outline-dark',
    features: [
      { key: 'everything', included: true },
      { key: 'manager', included: true },
      { key: 'ai', included: true },
      { key: 'multibranch', included: true },
      { key: 'hipaa', included: true },
      { key: 'sla', included: true },
    ],
  },
]

export function PlansStep() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data, setField } = useOnboardingStore()
  const [selected, setSelected] = useState<PlanId | null>(data.selectedPlan)

  const handleSelect = (id: PlanId) => {
    setSelected(id)
    setField('selectedPlan', id)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Progress */}
      <div className="border-b border-[#eae7e7] px-10 py-6">
        <OnboardingProgress currentStep={5} totalSteps={5} />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-10 py-10">
        <div className="w-full max-w-[960px]">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-16 text-center"
          >
            <h1 className="text-[48px] font-extrabold tracking-[-1.2px] text-[#2f2e2e]">
              {t('onboarding.plans.title')}
            </h1>
            <p className="mx-auto mt-4 max-w-[672px] text-[18px] text-[#5c5b5b]">
              {t('onboarding.plans.subtitle')}
            </p>
          </motion.div>

          {/* Cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-3 gap-8 pb-5 pt-5"
          >
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
                className="relative"
              >
                {plan.recommended && (
                  <div className="absolute left-1/2 top-[-16px] z-10 -translate-x-1/2 rounded-[12px] px-4 py-1 bg-gradient-primary">
                    <span className="text-[12px] font-semibold uppercase tracking-[1.2px] text-white">
                      {t('onboarding.plans.recommended')}
                    </span>
                  </div>
                )}
                <div
                  className={cn(
                    'flex h-full cursor-pointer flex-col rounded-[8px] p-8 transition-all duration-200',
                    plan.recommended
                      ? 'border-2 border-[#04CF9E] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]'
                      : selected === plan.id
                        ? 'border-2 border-[#04CF9E]/50 bg-white shadow-md'
                        : 'border border-transparent bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:border-[#04CF9E]/20'
                  )}
                  onClick={() => handleSelect(plan.id)}
                >
                  {/* Tier */}
                  <p className="text-[14px] font-semibold uppercase tracking-[1.4px] text-[#5c5b5b]">
                    {t(`onboarding.plans.${plan.id}.tier`)}
                  </p>
                  {/* Price */}
                  <div className="mt-2 mb-8 flex items-baseline gap-1">
                    <span className="text-[36px] font-extrabold text-[#2f2e2e]">
                      {t(`onboarding.plans.${plan.id}.price`)}
                    </span>
                    {plan.hasMonthlyPrice && (
                      <span className="text-[14px] text-[#5c5b5b]">
                        {t('onboarding.plans.perMonth')}
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex flex-1 flex-col gap-4 mb-10">
                    {plan.features.map((feature) => (
                      <div key={feature.key} className="flex items-center gap-3">
                        {feature.included ? (
                          <div className={cn(
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                            plan.recommended ? 'bg-[#04CF9E]' : 'bg-[#04CF9E]/80'
                          )}>
                            <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                          </div>
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-[rgba(175,172,172,0.6)]" />
                        )}
                        <span className={cn(
                          'text-[14px]',
                          feature.included ? 'text-[#2f2e2e]' : 'text-[rgba(175,172,172,0.6)]'
                        )}>
                          {t(`onboarding.plans.${plan.id}.features.${feature.key}`)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  {plan.ctaStyle === 'gradient' ? (
                    <button
                      type="button"
                      className="w-full rounded-[4px] py-4 text-[14px] font-semibold text-white transition-all bg-gradient-primary"
                    >
                      {t(`onboarding.plans.${plan.id}.cta`)}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={cn(
                        'w-full rounded-[4px] border py-4 text-[14px] font-semibold text-[#2f2e2e] transition-all',
                        plan.id === 'starter' ? 'border-[#afacac]' : 'border-[#2f2e2e]'
                      )}
                    >
                      {t(`onboarding.plans.${plan.id}.cta`)}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#eae7e7] px-10 py-5">
        <button
          type="button"
          onClick={() => navigate('/onboarding/working-hours')}
          className="flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[1.4px] text-[#5c5b5b] hover:text-[#2f2e2e] transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-3 w-3" />
          {t('onboarding.previous')}
        </button>
        <button
          type="button"
          onClick={() => navigate('/onboarding/welcome')}
          className="flex items-center gap-4 rounded-[12px] px-10 py-4 text-[18px] font-bold text-white transition-all hover:-translate-y-0.5 cursor-pointer bg-gradient-primary-btn"
        >
          <span>{t('onboarding.nextStep')}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
