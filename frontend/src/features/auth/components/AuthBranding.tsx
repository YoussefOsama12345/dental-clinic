import { useState, useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Target, FileText, TrendingUp, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DentAIIcon } from '@/components/ui/dentai-logo'

const slideIcons = [Search, Target, FileText, TrendingUp, Zap]

const avatars = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/67.jpg',
]

export default function AuthBranding() {
  const { t } = useTranslation()
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = useMemo(
    () =>
      slideIcons.map((icon, i) => ({
        title: t(`auth.branding.slide${i + 1}Title`),
        withText: t(`auth.branding.slide${i + 1}With`),
        accent: t(`auth.branding.slide${i + 1}Highlight`),
        description: t(`auth.branding.slide${i + 1}Description`),
        icon,
      })),
    [t]
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  const slide = slides[currentSlide]

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">

      {/* ── Content ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col h-full px-10 xl:px-14 2xl:px-16">

        {/* Logo */}
        <div className="flex items-center gap-3 pt-10">
          <DentAIIcon />
        </div>

        {/* Animated slides */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="min-h-[280px] flex flex-col justify-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                <h1 className="text-[2.75rem] xl:text-5xl 2xl:text-[3.5rem] font-black text-[#0f172a] leading-[1.15] mb-6">
                  {slide.title}
                  <br />
                  {slide.withText}{' '}
                  <span className="text-[#04CF9E]">{slide.accent}</span>
                </h1>
                <p className="text-[15px] xl:text-base text-[#64748b] leading-relaxed max-w-sm">
                  {slide.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Avatars + social proof */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex -space-x-2">
              {avatars.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="w-9 h-9 rounded-full border-2 border-sidebar object-cover"
                />
              ))}
            </div>
            <span className="text-[#64748b] text-sm font-medium">
              {t('auth.branding.socialProof')}
            </span>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="flex items-center gap-2 pb-10 xl:pb-12">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className="flex-1 transition-all duration-300 cursor-pointer"
              aria-label={`${i + 1}`}
            >
              <div
                className={`w-full h-1.5 rounded-full transition-all duration-500 ${
                  i === currentSlide
                    ? 'bg-[#04CF9E]'
                    : 'bg-[#0f172a]/10 hover:bg-[#0f172a]/20'
                }`}
              />
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
