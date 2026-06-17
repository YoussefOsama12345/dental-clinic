import { useMemo } from 'react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createForgotPasswordSchema, type ForgotPasswordFormData } from '@/features/auth/schemas/auth.schema'
import { authService } from '@/features/auth/services/auth.service'
import { getApiErrorMessage } from '@/lib/api-client'
import { authInputCls, AUTH_SUBMIT_BTN } from '@/lib/auth-classes'

export function ForgotPasswordForm() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const schema = useMemo(() => createForgotPasswordSchema(t), [t])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setErrorMessage(null)
      await authService.requestPasswordReset(data.email)
      toast.success(t('auth.toast.resetCodeSent', 'Reset code sent. Check your email.'))
      navigate(`/verify-otp?email=${encodeURIComponent(data.email)}&flow=reset`)
    } catch (error) {
      const message = getApiErrorMessage(error, t('auth.toast.resetCodeFailed', 'Unable to send reset code.'))
      setErrorMessage(message)
      toast.error(message)
    }
  }

  return (
    <div className="space-y-8">

      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-[#0f172a]">{t('auth.forgotPasswordTitle')}</h1>
        <p className="text-[#64748b] text-base">{t('auth.forgotPasswordSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="email" className="block text-sm font-bold uppercase tracking-wide text-[#334155]">
            {t('auth.email')}
          </label>
          <Input
            id="email"
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            autoFocus
            {...register('email')}
            className={authInputCls(!!errors.email)}
          />
          {errors.email && <p className="text-sm text-red-500 mt-1 font-medium">{errors.email.message}</p>}

          <div className="flex items-center gap-2 mt-2">
            <ShieldCheck className="w-4 h-4 text-[#94a3b8] shrink-0" />
            <span className="text-xs text-[#94a3b8]">{t('auth.securityHint')}</span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className={AUTH_SUBMIT_BTN}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2.5">
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t('auth.sending')}</span>
            </div>
          ) : (
            t('auth.sendResetCode')
          )}
        </Button>

        {errorMessage ? <p className="text-sm font-medium text-red-500">{errorMessage}</p> : null}
      </form>

      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 text-[15px] text-[#64748b] hover:text-[#0f172a] font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('auth.backToLogin')}
        </Link>
      </div>
    </div>
  )
}
