import { AuthTransition } from '@/transitions'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  return (
    <AuthTransition>
      <LoginForm />
    </AuthTransition>
  )
}
