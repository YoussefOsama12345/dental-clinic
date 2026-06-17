import { ArrowLeft, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FormPageShellProps {
  backHref: string
  backLabel: string
  title: string
  subtitle: string
  cancelHref: string
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  submitting?: boolean
  submitLabel?: string
  sidebar?: React.ReactNode
  children: React.ReactNode
}

interface FormSectionProps {
  title: string
  description?: string
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
}

export function FormPageShell({
  backHref,
  backLabel,
  title,
  subtitle,
  cancelHref,
  onSubmit,
  submitting,
  submitLabel,
  sidebar: _sidebar,
  children,
}: FormPageShellProps) {
  const { t } = useTranslation()

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-[980px] flex-col gap-6 pb-10">
      <div className="flex justify-center xl:justify-start">
        <Link to={backHref} className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {backLabel}
        </Link>
      </div>

      <div className="flex flex-col gap-4 rounded-[22px] border border-border/70 bg-card px-6 py-5 shadow-none sm:px-7 sm:py-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 self-start">
          <Button
            asChild
            type="button"
            variant="outline"
            className="h-11 rounded-[12px] border-border/80 bg-white px-5 font-semibold text-[#334155] shadow-sm transition-all hover:border-[#04CF9E]/30 hover:bg-[#04CF9E]/5 hover:text-[#067356]"
          >
            <Link to={cancelHref}>{t('common.cancel')}</Link>
          </Button>
          <Button type="submit" disabled={submitting} className="h-11 min-w-[120px] bg-[#04CF9E] px-5 text-white hover:bg-[#03b589]">
            {submitting ? t('common.saving') : submitLabel ?? t('common.save')}
          </Button>
        </div>
      </div>

      <div className="space-y-7">{children}</div>
    </form>
  )
}

export function FormSection({ title, description, icon: Icon, children, className }: FormSectionProps) {
  return (
    <Card className={cn('overflow-visible border-border/70 shadow-none', className)}>
      <CardHeader className="border-b border-border/60 px-7 pt-7 pb-5">
        <div className="flex items-center gap-3.5">
          {Icon ? <Icon className="h-4 w-4 shrink-0 text-[#067356]" /> : null}
          <div>
            <CardTitle className="text-[15px] font-semibold">{title}</CardTitle>
            {description ? <CardDescription className="mt-1.5 text-sm leading-6">{description}</CardDescription> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn('space-y-5 px-7 pt-6 pb-7', Icon ? '' : 'pt-7')}>{children}</CardContent>
    </Card>
  )
}
