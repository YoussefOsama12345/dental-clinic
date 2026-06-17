import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import type { ReactElement } from 'react'
import { mailConfig } from '../config/mail.config'
import { AppError } from './app-error'

const transporter = nodemailer.createTransport({
  host: mailConfig.host,
  port: mailConfig.port,
  secure: mailConfig.secure,
  auth: mailConfig.auth,
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,
})

export interface SendMailOptions {
  to: string
  subject: string
  react: ReactElement
  text?: string
}

export async function renderEmail(react: ReactElement) {
  return render(react, { pretty: true })
}

export async function sendMail({ to, subject, react, text }: SendMailOptions) {
  try {
    const html = await renderEmail(react)
    return await transporter.sendMail({
      from: `${mailConfig.from.name} <${mailConfig.from.address}>`,
      to,
      subject,
      html,
      text,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown SMTP error'
    throw new AppError(502, 'MAIL_DELIVERY_FAILED', `Email delivery failed: ${message}`)
  }
}

export async function verifyMailerConnection() {
  return transporter.verify()
}
