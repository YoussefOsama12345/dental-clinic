import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createLoginSchema, type LoginFormData } from '@/features/auth/schemas/auth.schema'
import { authInputCls, AUTH_SUBMIT_BTN } from '@/lib/auth-classes'
import { authService } from '@/features/auth/services/auth.service'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { getApiErrorMessage } from '@/lib/api-client'

export function LoginForm() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const setUser = useAuthStore((s) => s.setUser)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const schema = useMemo(() => createLoginSchema(t), [t])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMessage(null)
      const res = await authService.signIn(data.email, data.password)
      setUser(res.user)
      toast.success(t('auth.toast.signedIn', 'Signed in successfully.'))
      navigate('/', { replace: true })
    } catch (error) {
      const message = getApiErrorMessage(error, t('auth.toast.signInFailed', 'Could not sign in.'))
      setErrorMessage(message)
      toast.error(message)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[30px] font-bold tracking-[-0.75px] text-[#2f2e2e] leading-[36px]">
          {t('auth.welcomeBack')}
        </h1>
        <p className="text-base text-[#5c5b5b] leading-[24px]">
          {t('auth.loginSubtitle')}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email */}
        <div className="space-y-3">
          <label htmlFor="login-email" className="block text-sm font-bold uppercase tracking-wide text-[#334155]">
            {t('auth.email')}
          </label>
          <Input
            id="login-email"
            type="email"
            autoFocus
            placeholder={t('auth.studioEmailPlaceholder')}
            {...register('email')}
            className={authInputCls(!!errors.email)}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-bold uppercase tracking-wide text-[#334155]">
              {t('auth.password')}
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-bold uppercase tracking-wide text-[#04CF9E] hover:text-[#03b589] transition-colors"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.passwordPlaceholder')}
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
          {errors.password && (
            <p className="text-sm text-red-500 mt-1 font-medium">{errors.password.message}</p>
          )}
        </div>

        {errorMessage ? <p className="text-sm font-medium text-red-500">{errorMessage}</p> : null}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className={AUTH_SUBMIT_BTN}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2.5">
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t('auth.signingIn')}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2.5">
              <span>{t('auth.signIn')}</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          )}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-[15px] text-[#64748b]">
        {t('auth.noAccount')}{' '}
        <Link
          to="/register"
          className="font-semibold text-[#04CF9E] hover:text-[#03b589] transition-colors"
        >
          {t('auth.signUp')}
        </Link>
      </p>
    </div>
  )
}
