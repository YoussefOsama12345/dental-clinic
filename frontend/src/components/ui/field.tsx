import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface FieldProps {
  label: string
  htmlFor?: string
  error?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

/** Labeled form field wrapper with error slot. Reused across every form. */
export function Field({ label, htmlFor, error, required, className, children }: FieldProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
        {required ? <span className="text-red-500"> *</span> : <span className="ms-1 font-medium normal-case tracking-normal text-muted-foreground/70">({t('common.optional', 'optional')})</span>}
      </label>
      {children}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  )
}
