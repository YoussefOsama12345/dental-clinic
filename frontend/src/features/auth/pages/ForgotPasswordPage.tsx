import { AuthTransition } from '@/transitions'
import { ForgotPasswordForm } from '../components/ForgotPasswordForm'

export function ForgotPasswordPage() {
  return (
    <AuthTransition>
      <ForgotPasswordForm />
    </AuthTransition>
  )
}
