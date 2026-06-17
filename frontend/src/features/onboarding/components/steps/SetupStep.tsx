import { useNavigate } from 'react-router'
import { MapPin, Phone, ChevronLeft, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { OnboardingProgress } from '../OnboardingProgress'
import { useOnboardingStore } from '../../store/onboarding.store'
import i18n from '@/i18n'

const inputCls =
  'h-14 w-full rounded-[12px] bg-[#f3f0ef] px-5 text-[16px] font-medium text-[#2f2e2e] placeholder:text-[rgba(120,118,118,0.6)] focus:outline-none focus:ring-2 focus:ring-[#04CF9E]/30 transition-all'

export function SetupStep() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data, setField } = useOnboardingStore()

  const handleLanguage = (lang: 'en' | 'ar') => {
    setField('language', lang)
    i18n.changeLanguage(lang)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Progress */}
      <div className="border-b border-[#eae7e7] px-10 py-6">
        <OnboardingProgress currentStep={2} totalSteps={5} />
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
            <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-[#04CF9E] mb-3">
              {t('onboarding.setup.tag')}
            </p>
            <h1 className="text-[48px] font-extrabold tracking-[-1.2px] text-[#2f2e2e]">
              {t('onboarding.setup.title')}
            </h1>
            <p className="mx-auto mt-4 max-w-[480px] text-[18px] text-[#5c5b5b]">
              {t('onboarding.setup.subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="flex flex-col gap-6"
          >
            {/* ── Preferred Language ─────────────────────────────────────── */}
            <div className="flex flex-col gap-3">
              <label className="text-[14px] font-semibold tracking-[-0.35px] text-[#2f2e2e]">
                {t('onboarding.setup.language')}
              </label>
              <select
                value={data.language}
                onChange={(e) => handleLanguage(e.target.value as 'en' | 'ar')}
                className={`${inputCls} cursor-pointer appearance-none`}
              >
                <option value="en">🇬🇧 {t('onboarding.setup.languageEn')}</option>
                <option value="ar">🇸🇦 {t('onboarding.setup.languageAr')}</option>
              </select>
            </div>

            {/* ── Clinic Address ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-3">
              <label className="text-[14px] font-semibold tracking-[-0.35px] text-[#2f2e2e]">
                {t('onboarding.setup.clinicAddress')}
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#04CF9E]" />
                <input
                  type="text"
                  value={data.clinicAddress}
                  onChange={(e) => setField('clinicAddress', e.target.value)}
                  placeholder={t('onboarding.setup.clinicAddressPlaceholder')}
                  className={`${inputCls} pl-12`}
                />
              </div>
            </div>

            {/* ── Phone ──────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3">
              <label className="text-[14px] font-semibold tracking-[-0.35px] text-[#2f2e2e]">
                {t('onboarding.setup.phone')}
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#04CF9E]" />
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder={t('onboarding.setup.phonePlaceholder')}
                  className={`${inputCls} pl-12`}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#eae7e7] px-10 py-5">
        <button
          type="button"
          onClick={() => navigate('/onboarding/identity')}
          className="flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[1.4px] text-[#5c5b5b] hover:text-[#2f2e2e] transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-3 w-3" />
          {t('onboarding.previous')}
        </button>
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-[14px] font-semibold text-[#787676] hover:text-[#2f2e2e] transition-colors cursor-pointer"
          >
            {t('onboarding.skipForNow')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/onboarding/specialty')}
            className="flex items-center gap-4 rounded-[12px] px-10 py-4 text-[18px] font-bold text-white transition-all hover:-translate-y-0.5 cursor-pointer bg-gradient-primary-btn"
          >
            <span>{t('onboarding.nextStep')}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
