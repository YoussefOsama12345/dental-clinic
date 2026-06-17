import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Briefcase, Smile, Zap, BookOpen, Sparkles, ChevronLeft, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { OnboardingProgress } from '../OnboardingProgress'
import { OnboardingSelectionCard } from '../OnboardingSelectionCard'
import { useOnboardingStore } from '../../store/onboarding.store'
import type { LucideIcon } from 'lucide-react'

const voices: { id: string; icon: LucideIcon }[] = [
  { id: 'professional', icon: Briefcase },
  { id: 'friendly', icon: Smile },
  { id: 'bold', icon: Zap },
  { id: 'educational', icon: BookOpen },
  { id: 'inspirational', icon: Sparkles },
]

export function VoiceStep() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data, setField } = useOnboardingStore()
  const [selected, setSelected] = useState<string | null>(data.selectedVoice)

  const handleSelect = (id: string) => {
    setSelected(id)
    setField('selectedVoice', id)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Progress */}
      <div className="border-b border-[#eae7e7] px-10 py-6">
        <OnboardingProgress currentStep={4} totalSteps={7} />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-10 py-10">
        <div className="w-full max-w-[896px]">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-12 text-center"
          >
            <h1 className="text-[48px] font-extrabold tracking-[-1.2px] text-[#2f2e2e]">
              {t('onboarding.voice.title')}{' '}
              <span className="text-[#04CF9E]">{t('onboarding.voice.titleHighlight')}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-[560px] text-[18px] text-[#5c5b5b]">
              {t('onboarding.voice.subtitle')}
            </p>
          </motion.div>

          {/* Grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-3 gap-6"
          >
            {voices.map((voice, idx) => (
              <motion.div
                key={voice.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
                className="flex h-full"
              >
                <OnboardingSelectionCard
                  title={t(`onboarding.voice.items.${voice.id}.title`)}
                  description={t(`onboarding.voice.items.${voice.id}.description`)}
                  icon={voice.icon}
                  isSelected={selected === voice.id}
                  onClick={() => handleSelect(voice.id)}
                  className="w-full"
                />
              </motion.div>
            ))}
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
          disabled={!selected}
          className="flex items-center gap-4 rounded-[12px] px-10 py-4 text-[18px] font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer disabled:cursor-not-allowed bg-gradient-primary-btn"
        >
          <span>{t('onboarding.nextStep')}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
