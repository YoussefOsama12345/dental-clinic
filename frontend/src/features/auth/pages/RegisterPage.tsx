import { AuthTransition } from '@/transitions'
import { RegisterForm } from '../components/RegisterForm'

export function RegisterPage() {
  return (
    <AuthTransition>
      <RegisterForm />
    </AuthTransition>
  )
}
