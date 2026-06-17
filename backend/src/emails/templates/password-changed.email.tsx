import { Text } from '@react-email/components'
import EmailCard from '../components/EmailCard'
import EmailLayout from '../layout/EmailLayout'

interface PasswordChangedEmailProps {
  name: string
  email: string
}

export default function PasswordChangedEmail({ name, email }: PasswordChangedEmailProps) {
  return (
    <EmailLayout heading="Password changed successfully" preview="Your dentAI password was changed">
      <Text style={paragraph}>Hello {name},</Text>
      <Text style={paragraph}>The password for <strong>{email}</strong> was updated successfully.</Text>
      <EmailCard title="Did not make this change?">
        <Text style={small}>If this was not you, contact your clinic administrator immediately and reset the password again.</Text>
      </EmailCard>
    </EmailLayout>
  )
}

const paragraph = { color: '#334155', fontSize: '15px', lineHeight: '24px', margin: '0 0 12px' }
const small = { color: '#64748b', fontSize: '13px', lineHeight: '22px', margin: 0 }
