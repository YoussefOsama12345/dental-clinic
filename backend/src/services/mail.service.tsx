import EmailVerificationCodeEmail from '../emails/templates/email-verification-code.email'
import PasswordChangedEmail from '../emails/templates/password-changed.email'
import PasswordResetCodeEmail from '../emails/templates/password-reset-code.email'
import WelcomeEmail from '../emails/templates/welcome.email'
import { env } from '../config/env'
import { sendMail } from '../utils/mailer'

const appUrl = env.corsOrigins[0] ?? 'http://localhost:5173'

export async function sendWelcomeEmail(recipient: { email: string; name: string }) {
  return sendMail({
    to: recipient.email,
    subject: 'Welcome to dentAI',
    react: <WelcomeEmail appUrl={appUrl} email={recipient.email} name={recipient.name} />,
    text: `Welcome to dentAI, ${recipient.name}. Your account for ${recipient.email} is ready. Open the app at ${appUrl}.`,
  })
}

export async function sendPasswordResetCodeEmail(recipient: { email: string; name: string; code: string }) {
  return sendMail({
    to: recipient.email,
    subject: 'Your dentAI password reset code',
    react: <PasswordResetCodeEmail code={recipient.code} email={recipient.email} name={recipient.name} />,
    text: `Hello ${recipient.name}, your dentAI password reset code is ${recipient.code}.`,
  })
}

export async function sendEmailVerificationCodeEmail(recipient: { email: string; name: string; code: string }) {
  return sendMail({
    to: recipient.email,
    subject: 'Verify your dentAI email',
    react: <EmailVerificationCodeEmail code={recipient.code} email={recipient.email} name={recipient.name} />,
    text: `Hello ${recipient.name}, your dentAI email verification code is ${recipient.code}.`,
  })
}

export async function sendPasswordChangedEmail(recipient: { email: string; name: string }) {
  return sendMail({
    to: recipient.email,
    subject: 'Your dentAI password was changed',
    react: <PasswordChangedEmail email={recipient.email} name={recipient.name} />,
    text: `Hello ${recipient.name}, the password for ${recipient.email} was changed successfully.`,
  })
}
