import { Text } from '@react-email/components'
import EmailButton from '../components/EmailButton'
import EmailLayout from '../layout/EmailLayout'

interface WelcomeEmailProps {
  name: string
  email: string
  appUrl: string
}

export default function WelcomeEmail({ name, email, appUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout heading="Welcome to dentAI" preview="Your dentAI account is ready">
      <Text style={paragraph}>Hello {name},</Text>
      <Text style={paragraph}>Your dentAI account for <strong>{email}</strong> has been created successfully.</Text>
      <Text style={paragraph}>You can now sign in to manage patients, appointments, staff, and clinic workflows.</Text>
      <EmailButton href={`${appUrl}/#/login`}>Open dentAI</EmailButton>
    </EmailLayout>
  )
}

const paragraph = { color: '#334155', fontSize: '15px', lineHeight: '24px', margin: '0 0 12px' }
