import { Section, Text } from '@react-email/components'
import type { ReactNode } from 'react'

interface EmailCardProps {
  title?: string
  children: ReactNode
}

export default function EmailCard({ title, children }: EmailCardProps) {
  return (
    <Section style={card}>
      {title ? <Text style={titleStyle}>{title}</Text> : null}
      {children}
    </Section>
  )
}

const card = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  margin: '20px 0',
  padding: '20px',
}

const titleStyle = {
  color: '#0f172a',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0 0 10px',
}
