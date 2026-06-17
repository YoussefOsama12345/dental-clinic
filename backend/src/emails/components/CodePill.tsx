import { Section, Text } from '@react-email/components'

interface CodePillProps {
  code: string
}

export default function CodePill({ code }: CodePillProps) {
  return (
    <Section style={wrap}>
      <Text style={codeStyle}>{code}</Text>
    </Section>
  )
}

const wrap = { margin: '24px 0' }
const codeStyle = {
  backgroundColor: '#0f172a',
  borderRadius: '16px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '28px',
  fontWeight: '700',
  letterSpacing: '0.28em',
  margin: 0,
  padding: '14px 22px',
}
