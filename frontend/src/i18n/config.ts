import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import enTranslation from '../../public/locales/en/translation.json'
import arTranslation from '../../public/locales/ar/translation.json'

export const LANGUAGE_STORAGE_KEY = 'dentai-lang'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    resources: {
      en: { translation: enTranslation },
      ar: { translation: arTranslation },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })

// Apply direction on startup from stored preference
const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en'
document.documentElement.lang = saved
document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr'

export default i18n
