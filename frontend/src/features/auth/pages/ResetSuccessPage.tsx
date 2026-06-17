import { AuthTransition } from '@/transitions'
import { ResetSuccessForm } from '../components/ResetSuccessForm'

export function ResetSuccessPage() {
  return (
    <AuthTransition>
      <ResetSuccessForm />
    </AuthTransition>
  )
}
