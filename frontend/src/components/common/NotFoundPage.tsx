import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Home } from 'lucide-react'

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-sidebar px-6 text-center">
      <p className="text-[120px] font-black leading-none text-[#04CF9E]/20">404</p>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          {t('notFound.title', 'Page not found')}
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {t('notFound.subtitle', "The page you're looking for doesn't exist or has moved.")}
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-[10px] bg-[#04CF9E] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#03b589]"
      >
        <Home className="h-4 w-4" />
        {t('notFound.backHome', 'Back to dashboard')}
      </Link>
    </div>
  )
}
