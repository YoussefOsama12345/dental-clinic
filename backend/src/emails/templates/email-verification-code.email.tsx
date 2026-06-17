import { Text } from '@react-email/components'
import CodePill from '../components/CodePill'
import EmailCard from '../components/EmailCard'
import EmailLayout from '../layout/EmailLayout'

export default function EmailVerificationCodeEmail({ code, email, name }: { code: string; email: string; name: string }) {
  return (
    <EmailLayout heading="Verify your email" preview={`Your dentAI verification code is ${code}`}>
      <Text style={paragraph}>Hello {name},</Text>
      <Text style={paragraph}>Use this code to verify <strong>{email}</strong> and finish creating your dentAI account.</Text>
      <CodePill code={code} />
      <EmailCard title="Security note">
        <Text style={small}>This code expires in 10 minutes. If you did not create this account, you can safely ignore this message.</Text>
      </EmailCard>
    </EmailLayout>
  )
}

const paragraph = { color: '#334155', fontSize: '15px', lineHeight: '24px', margin: '0 0 12px' }
const small = { color: '#64748b', fontSize: '13px', lineHeight: '22px', margin: 0 }
