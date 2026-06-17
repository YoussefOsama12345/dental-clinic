import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createRegisterSchema, type RegisterFormData } from '@/features/auth/schemas/auth.schema'
import { authInputCls, AUTH_SUBMIT_BTN } from '@/lib/auth-classes'
import { authService } from '@/features/auth/services/auth.service'
import { getApiErrorMessage } from '@/lib/api-client'
import PasswordStrength from './PasswordStrength'

export function RegisterForm() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)
  const schema = useMemo(() => createRegisterSchema(t), [t])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const passwordValue = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setErrorMessage(null)
      await authService.signUp(data.name, data.email, data.password)
      toast.success(t('auth.toast.accountCreated', 'Account created. Check your email for the verification code.'))
      navigate(`/verify-otp?email=${encodeURIComponent(data.email)}&flow=register`)
    } catch (error) {
      const message = getApiErrorMessage(error, t('auth.toast.createAccountFailed', 'Unable to create account.'))
      setErrorMessage(message)
      toast.error(message)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[30px] font-bold tracking-[-0.75px] text-[#2f2e2e] leading-[36px]">
          {t('auth.createAccount')}
        </h1>
        <p className="text-sm text-[#5c5b5b]">
          {t('auth.registerSubtitle')}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Full Name */}
        <div className="space-y-3">
          <label htmlFor="reg-name" className="block text-sm font-bold uppercase tracking-wide text-[#334155]">
            {t('auth.fullName')}
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
            <Input
              id="reg-name"
              type="text"
              autoFocus
              placeholder={t('auth.fullNamePlaceholder')}
              {...register('name')}
              className={`${authInputCls(!!errors.name)} !pl-11`}
            />
          </div>
          {errors.name && <p className="text-sm text-red-500 mt-1 font-medium">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-3">
          <label htmlFor="reg-email" className="block text-sm font-bold uppercase tracking-wide text-[#334155]">
            {t('auth.email')}
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
            <Input
              id="reg-email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              {...register('email')}
              className={`${authInputCls(!!errors.email)} !pl-11`}
            />
          </div>
          {errors.email && <p className="text-sm text-red-500 mt-1 font-medium">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-3">
          <label htmlFor="reg-password" className="block text-sm font-bold uppercase tracking-wide text-[#334155]">
            {t('auth.password')}
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.createPassword')}
              {...register('password')}
              className={`${authInputCls(!!errors.password)} !pl-11 pe-13`}
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

        {/* Confirm Password */}
        <div className="space-y-3">
          <label htmlFor="reg-confirm-password" className="block text-sm font-bold uppercase tracking-wide text-[#334155]">
            {t('auth.confirmPassword')}
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
            <Input
              id="reg-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              {...register('confirmPassword')}
              className={`${authInputCls(!!errors.confirmPassword)} !pl-11 pe-13`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute end-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] transition-colors cursor-pointer p-1"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-red-500 mt-1 font-medium">{errors.confirmPassword.message}</p>}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3 py-1">
          <div className="flex h-5 items-center shrink-0 mt-0.5">
            <input
              type="checkbox"
              id="reg-terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="h-4 w-4 border border-[#afacac] bg-white cursor-pointer accent-[#04CF9E] rounded"
            />
          </div>
          <label htmlFor="reg-terms" className="text-[13px] text-[#5c5b5b] leading-[20px] cursor-pointer">
            {t('auth.agreeToThe')}{' '}
            <Link to="/terms" className="font-semibold text-[#04CF9E] hover:text-[#03b589]">
              {t('auth.termsOfService')}
            </Link>
            {' '}{t('auth.and')}{' '}
            <Link to="/privacy" className="font-semibold text-[#04CF9E] hover:text-[#03b589]">
              {t('auth.privacyPolicy')}
            </Link>.
          </label>
        </div>

        {errorMessage ? <p className="text-sm font-medium text-red-500">{errorMessage}</p> : null}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting || !agreed}
          className={AUTH_SUBMIT_BTN}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2.5">
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t('auth.creatingAccount')}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2.5">
              <span>{t('auth.createAccount')}</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          )}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-[15px] text-[#64748b] border-t border-[#eae7e7] pt-6">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link to="/login" className="font-semibold text-[#04CF9E] hover:text-[#03b589] transition-colors">
          {t('auth.signIn2')}
        </Link>
      </p>
    </div>
  )
}
