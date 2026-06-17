import { Body, Container, Head, Hr, Html, Preview, Section, Text } from '@react-email/components'
import type { ReactNode } from 'react'

interface EmailLayoutProps {
  preview: string
  heading: string
  children: ReactNode
}

export default function EmailLayout({ preview, heading, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={brandSection}>
            <Text style={brand}>dentAI</Text>
            <Text style={tagline}>Clinic operations, simplified</Text>
          </Section>
          <Section style={card}>
            <Text style={headingStyle}>{heading}</Text>
            {children}
          </Section>
          <Hr style={divider} />
          <Text style={footer}>This email was sent by dentAI. If you did not expect it, please contact your clinic administrator.</Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = { backgroundColor: '#edf3f6', fontFamily: 'Arial, sans-serif', margin: 0, padding: '32px 0' }
const container = { margin: '0 auto', maxWidth: '620px', padding: '0 20px' }
const brandSection = { paddingBottom: '16px' }
const brand = { color: '#067356', fontSize: '28px', fontWeight: '700', margin: 0 }
const tagline = { color: '#64748b', fontSize: '12px', letterSpacing: '0.12em', margin: '6px 0 0', textTransform: 'uppercase' as const }
const card = { backgroundColor: '#ffffff', border: '1px solid #dbe4ea', borderRadius: '20px', padding: '32px' }
const headingStyle = { color: '#0f172a', fontSize: '24px', fontWeight: '700', margin: '0 0 20px' }
const divider = { borderColor: '#dbe4ea', margin: '20px 0' }
const footer = { color: '#64748b', fontSize: '12px', lineHeight: '18px', margin: 0 }
