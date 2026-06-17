import { Text } from '@react-email/components'
import CodePill from '../components/CodePill'
import EmailCard from '../components/EmailCard'
import EmailLayout from '../layout/EmailLayout'

interface PasswordResetCodeEmailProps {
  name: string
  email: string
  code: string
}

export default function PasswordResetCodeEmail({ name, email, code }: PasswordResetCodeEmailProps) {
  return (
    <EmailLayout heading="Reset your password" preview={`Your dentAI reset code is ${code}`}>
      <Text style={paragraph}>Hello {name},</Text>
      <Text style={paragraph}>We received a request to reset the password for <strong>{email}</strong>.</Text>
      <CodePill code={code} />
      <EmailCard title="Security note">
        <Text style={small}>This code expires in 10 minutes. If you did not request this change, you can safely ignore this message.</Text>
      </EmailCard>
    </EmailLayout>
  )
}

const paragraph = { color: '#334155', fontSize: '15px', lineHeight: '24px', margin: '0 0 12px' }
const small = { color: '#64748b', fontSize: '13px', lineHeight: '22px', margin: 0 }
