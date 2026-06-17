import { AuthTransition } from '@/transitions'
import { ResetPasswordForm } from '../components/ResetPasswordForm'

export function ResetPasswordPage() {
  return (
    <AuthTransition>
      <ResetPasswordForm />
    </AuthTransition>
  )
}
