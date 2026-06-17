import { ar, enUS } from 'date-fns/locale'
import type { Locale } from 'date-fns'

/** Pick the date-fns locale matching the active i18n language. */
export function localeFor(lang: string | undefined): Locale {
  return lang?.startsWith('ar') ? ar : enUS
}
