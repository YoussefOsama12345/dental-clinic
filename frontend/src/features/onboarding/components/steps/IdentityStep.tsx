import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Camera, Trash2, User, ChevronLeft, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { OnboardingProgress } from '../OnboardingProgress'
import { useOnboardingStore } from '../../store/onboarding.store'

export function IdentityStep() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data, setField } = useOnboardingStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarSrc, setAvatarSrc] = useState<string | null>(data.avatarUrl)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatarSrc(url)
      setField('avatarUrl', url)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarSrc(null)
    setField('avatarUrl', null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex h-full flex-col">
      {/* Progress */}
      <div className="border-b border-[#eae7e7] px-10 py-6">
        <OnboardingProgress currentStep={1} totalSteps={5} />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-10 py-10">
        <div className="w-full max-w-[640px]">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-12 text-center"
          >
            <h1 className="text-[48px] font-extrabold tracking-[-1.2px] text-[#2f2e2e]">
              {t('onboarding.identity.title')}
            </h1>
            <p className="mx-auto mt-4 max-w-[480px] text-[18px] text-[#5c5b5b]">
              {t('onboarding.identity.subtitle')}
            </p>
          </motion.div>

          {/* Avatar picker */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="mb-10 flex flex-col items-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="relative">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex h-40 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-[#eae7e7] bg-white shadow-sm"
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-16 w-16 text-[#d1cece]" />
                )}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-7 w-7 text-white" />
                </div>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full shadow-lg cursor-pointer bg-gradient-primary"
              >
                <Camera className="h-4 w-4 text-white" />
              </button>
            </div>
            <div className="mt-4 text-center">
              <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-[#5c5b5b]">
                {t('onboarding.identity.profilePhoto')}
              </p>
              <p className="mt-1 text-[10px] text-[#787676]">{t('onboarding.identity.photoHint')}</p>
            </div>
            {avatarSrc && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="mt-2 flex items-center gap-1.5 text-[12px] text-red-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                {t('onboarding.identity.removePhoto')}
              </button>
            )}
          </motion.div>

          {/* Form fields */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold tracking-[-0.35px] text-[#2f2e2e]">
                {t('onboarding.identity.fullName')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => setField('fullName', e.target.value)}
                  placeholder={t('onboarding.identity.fullNamePlaceholder')}
                  className="h-14 w-full rounded-[12px] bg-[#f3f0ef] px-5 text-[16px] font-medium text-[#2f2e2e] placeholder:text-[rgba(120,118,118,0.6)] focus:outline-none focus:ring-2 focus:ring-[#04CF9E]/30"
                />
                <User className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#afacac]" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold tracking-[-0.35px] text-[#2f2e2e]">
                {t('onboarding.identity.clinicName')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={data.clinicName}
                  onChange={(e) => setField('clinicName', e.target.value)}
                  placeholder={t('onboarding.identity.clinicNamePlaceholder')}
                  className="h-14 w-full rounded-[12px] bg-[#f3f0ef] px-5 text-[16px] font-medium text-[#2f2e2e] placeholder:text-[rgba(120,118,118,0.6)] focus:outline-none focus:ring-2 focus:ring-[#04CF9E]/30"
                />
              </div>
              <p className="px-1 text-[11px] text-[#787676]">
                {t('onboarding.identity.clinicNameHint')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#eae7e7] px-10 py-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[1.4px] text-[#5c5b5b] hover:text-[#2f2e2e] transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-3 w-3" />
          {t('onboarding.previous')}
        </button>
        <button
          type="button"
          onClick={() => navigate('/onboarding/setup')}
          className="flex items-center gap-4 rounded-[12px] px-10 py-4 text-[18px] font-bold text-white transition-all hover:-translate-y-0.5 cursor-pointer bg-gradient-primary-btn"
        >
          <span>{t('onboarding.nextStep')}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
