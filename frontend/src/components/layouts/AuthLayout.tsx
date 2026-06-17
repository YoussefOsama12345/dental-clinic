import { Outlet } from 'react-router'
import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LANGUAGE_STORAGE_KEY } from '@/i18n'

export function AuthLayout() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const toggleLanguage = () => {
    const nextLang = isArabic ? 'en' : 'ar'
    i18n.changeLanguage(nextLang)
    document.documentElement.lang = nextLang
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang)
  }

  return (
    <div className="relative min-h-screen bg-sidebar flex items-center justify-center overflow-hidden">

      {/* ── Continuous dot grid — full page background ───────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #94a3b8 1.5px, transparent 1.5px)',
          backgroundSize: '26px 26px',
          opacity: 0.28,
        }}
      />

      <button
        type="button"
        onClick={toggleLanguage}
        className="absolute end-5 top-5 z-20 inline-flex h-10 items-center gap-2 px-1 text-sm font-bold text-[#64748b] transition-colors hover:text-[#04A47E]"
        title={t(isArabic ? 'header.switchToEnglish' : 'header.switchToArabic')}
        aria-label={t(isArabic ? 'header.switchToEnglish' : 'header.switchToArabic')}
      >
        <Languages className="h-4 w-4" />
        <span>{isArabic ? 'EN' : 'عربي'}</span>
      </button>

      <div className="w-full max-w-[460px] mx-auto px-4 sm:px-6 relative z-10">
        <Outlet />
      </div>

    </div>
  )
}
