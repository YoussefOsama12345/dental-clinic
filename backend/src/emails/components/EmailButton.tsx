import { Button } from '@react-email/components'
import type { ReactNode } from 'react'

interface EmailButtonProps {
  href: string
  children: ReactNode
}

export default function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Button href={href} style={button}>
      {children}
    </Button>
  )
}

const button = {
  backgroundColor: '#04CF9E',
  borderRadius: '12px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: '700',
  padding: '14px 22px',
  textDecoration: 'none',
}
