import {
  useState, useRef, useEffect, useCallback,
  useMemo,
  type KeyboardEvent, type ClipboardEvent, type ChangeEvent,
} from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { createVerifyOtpSchema, type VerifyOtpFormData } from '@/features/auth/schemas/auth.schema'
import { authService } from '@/features/auth/services/auth.service'
import { getApiErrorMessage } from '@/lib/api-client'
import { AUTH_SUBMIT_BTN } from '@/lib/auth-classes'

const RESEND_COOLDOWN = 60

export function VerifyOtpForm() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const flow = searchParams.get('flow') === 'register' ? 'register' : 'reset'
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const autoSubmitTriggered = useRef(false)
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN)
  const canResend = countdown === 0
  const schema = useMemo(() => createVerifyOtpSchema(t), [t])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleResend = async () => {
    if (!canResend) return
    try {
      setErrorMessage(null)
      flow === 'register'
        ? await authService.resendVerificationCode(email)
        : await authService.requestPasswordReset(email)
      setCountdown(RESEND_COOLDOWN)
      setValue('otp', '', { shouldValidate: false })
      inputRefs.current[0]?.focus()
      toast.success(t('auth.toast.codeResent', 'Code resent. Check your email.'))
    } catch (error) {
      const message = getApiErrorMessage(error, t('auth.toast.resendFailed', 'Unable to resend the code.'))
      setErrorMessage(message)
      toast.error(message)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(schema),
    defaultValues: { otp: '' },
  })

  const otpValue = watch('otp')
  const digits = otpValue.padEnd(6, ' ').split('').slice(0, 6)

  const onSubmit = useCallback(
    async (data: VerifyOtpFormData) => {
      try {
        setErrorMessage(null)
        if (flow === 'register') {
          await authService.verifyEmail(email, data.otp)
          toast.success(t('auth.toast.emailVerified', 'Email verified. You can now sign in.'))
          navigate('/login', { replace: true })
          return
        }
        await authService.verifyResetCode(email, data.otp)
        toast.success(t('auth.toast.codeVerified', 'Code verified. Set your new password.'))
        navigate(`/reset-password?email=${encodeURIComponent(email)}&code=${data.otp}`)
      } catch (error) {
        const message = getApiErrorMessage(error, t('auth.toast.verifyFailed', 'Unable to verify the code.'))
        setErrorMessage(message)
        toast.error(message)
      }
    },
    [navigate, email, flow]
  )

  useEffect(() => {
    if (otpValue.length === 6 && /^\d{6}$/.test(otpValue) && !autoSubmitTriggered.current) {
      autoSubmitTriggered.current = true
      handleSubmit(onSubmit)()
    }
    if (otpValue.length < 6) autoSubmitTriggered.current = false
  }, [otpValue, handleSubmit, onSubmit])

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length > 1) {
      const cleaned = value.replace(/\D/g, '').slice(0, 6)
      if (cleaned.length > 0) {
        setValue('otp', cleaned, { shouldValidate: false })
        inputRefs.current[Math.min(cleaned.length, 5)]?.focus()
        return
      }
    }
    if (!/^\d?$/.test(value)) return
    const newDigits = [...digits.map((d) => (d === ' ' ? '' : d))]
    newDigits[index] = value
    setValue('otp', newDigits.join('').replace(/ /g, ''), { shouldValidate: false })
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Backspace':
        if (!digits[index] || digits[index] === ' ') {
          if (index > 0) {
            e.preventDefault()
            const newDigits = [...digits.map((d) => (d === ' ' ? '' : d))]
            newDigits[index - 1] = ''
            setValue('otp', newDigits.join('').trimEnd(), { shouldValidate: false })
            inputRefs.current[index - 1]?.focus()
          }
        }
        break
      case 'ArrowLeft':
        e.preventDefault()
        if (index > 0) inputRefs.current[index - 1]?.focus()
        break
      case 'ArrowRight':
        e.preventDefault()
        if (index < 5) inputRefs.current[index + 1]?.focus()
        break
      case 'ArrowUp':
      case 'ArrowDown':
        e.preventDefault()
        break
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pastedData) return
    setValue('otp', pastedData, { shouldValidate: false })
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus()
  }

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c)
    : t('auth.yourEmail')

  return (
    <div className="space-y-8">

      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-[#0f172a]">{flow === 'register' ? t('auth.verifyEmailTitle', 'Verify your email') : t('auth.checkEmail')}</h1>
        <p className="text-[#64748b] text-base">
          {t('auth.verifySubtitle')}{' '}
          <span className="font-bold text-[#0f172a]">{maskedEmail}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Controller
          name="otp"
          control={control}
          render={() => (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2.5">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    autoFocus={index === 0}
                    value={digit === ' ' ? '' : digit}
                    onChange={(e) => handleChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={(e) => e.target.select()}
                    className={`flex h-14 w-full items-center justify-center rounded-[10px] border bg-[#f8faf9] text-center text-2xl font-bold text-[#0f172a] shadow-sm transition-all duration-200 focus:border-[#04CF9E] focus:ring-1 focus:ring-[#04CF9E] focus:outline-none placeholder:text-[#cbd5e1] ${
                      errors.otp
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-[#e2e8f0]'
                    }`}
                    placeholder="○"
                  />
                ))}
              </div>
              {errors.otp && (
                <p className="text-sm text-red-500 text-center font-medium mt-2">{errors.otp.message}</p>
              )}
              {errorMessage ? <p className="text-sm text-red-500 text-center font-medium mt-2">{errorMessage}</p> : null}
            </div>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className={AUTH_SUBMIT_BTN}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2.5">
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t('auth.verifying')}</span>
            </div>
          ) : (
            t('auth.verifyCode')
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-[15px] text-[#64748b]">
          {t('auth.didntReceive')}{' '}
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="text-[#04CF9E] hover:text-[#03b589] font-bold transition-colors cursor-pointer"
            >
              {t('auth.resendCode')}
            </button>
          ) : (
            <span className="font-semibold text-[#94a3b8]">{t('auth.resendIn', { seconds: formatTime(countdown) })}</span>
          )}
        </p>
      </div>

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
