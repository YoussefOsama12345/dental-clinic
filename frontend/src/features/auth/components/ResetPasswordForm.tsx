import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createResetPasswordSchema, type ResetPasswordFormData } from '@/features/auth/schemas/auth.schema'
import { authService } from '@/features/auth/services/auth.service'
import { getApiErrorMessage } from '@/lib/api-client'
import PasswordStrength from './PasswordStrength'
import { authInputCls, AUTH_SUBMIT_BTN } from '@/lib/auth-classes'

function ResetPasswordForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const schema = useMemo(() => createResetPasswordSchema(t), [t])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const email = searchParams.get('email') || ''
  const code = searchParams.get('code') || ''

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const passwordValue = watch('password')

  useEffect(() => {
    if (!email || !code) {
      navigate('/forgot-password', { replace: true })
    }
  }, [email, code, navigate])

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setErrorMessage(null)
      await authService.resetPassword(email, code, data.password)
      toast.success(t('auth.toast.passwordUpdated', 'Password updated successfully.'))
      navigate('/reset-success')
    } catch (error) {
      const message = getApiErrorMessage(error, t('auth.toast.passwordUpdateFailed', 'Unable to update the password.'))
      setErrorMessage(message)
      toast.error(message)
    }
  }

  return (
    <div className="space-y-8">

      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-[#0f172a]">{t('auth.setNewPassword')}</h1>
        <p className="text-[#64748b] text-base">{t('auth.setPasswordSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="password" className="block text-sm font-bold uppercase tracking-wide text-[#334155]">
            {t('auth.newPassword')}
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.newPasswordPlaceholder')}
              autoFocus
              {...register('password')}
              className={`${authInputCls(!!errors.password)} pe-13`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] transition-colors cursor-pointer p-1"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-500 mt-1 font-medium">{errors.password.message}</p>}
          <PasswordStrength password={passwordValue} />
        </div>

        <div className="space-y-3">
          <label htmlFor="confirm-password" className="block text-sm font-bold uppercase tracking-wide text-[#334155]">
            {t('auth.confirmNewPassword')}
          </label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirm ? 'text' : 'password'}
              placeholder={t('auth.confirmNewPasswordPlaceholder')}
              {...register('confirmPassword')}
              className={`${authInputCls(!!errors.confirmPassword)} pe-13`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute end-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] transition-colors cursor-pointer p-1"
            >
              {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-red-500 mt-1 font-medium">{errors.confirmPassword.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className={AUTH_SUBMIT_BTN}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2.5">
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t('auth.updating')}</span>
            </div>
          ) : (
            t('auth.updatePassword')
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

export { ResetPasswordForm }
export default ResetPasswordForm
