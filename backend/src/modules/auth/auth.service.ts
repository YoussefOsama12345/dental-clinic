import { createHmac, randomInt } from 'node:crypto'
import { AUTH } from '../../constants/app.constants'
import { env } from '../../config/env'
import { badRequest, conflict, unauthorized } from '../../utils/app-error'
import { nowIso } from '../../utils/date'
import { supabaseAuth } from '../../utils/supabase'
import { toAuthResponse, toAuthUser } from './auth.dto'
import type { SupabaseAuthSession } from './auth.model'
import { clearEmailVerificationCodes, clearResetCodes, createEmailVerificationCode, createResetCode, createUser, findUserByEmail, findUserById, findValidEmailVerificationCode, findValidResetCode, incrementEmailVerificationCodeAttempts, incrementResetCodeAttempts, markEmailVerificationCodeUsed, markResetCodeUsed, updateUser } from './auth.repository'
import { sendEmailVerificationCodeEmail, sendPasswordChangedEmail, sendPasswordResetCodeEmail, sendWelcomeEmail } from '../../services/mail.service'

const createSixDigitCode = () => String(randomInt(100000, 1000000))
const hashCode = (code: string) => createHmac('sha256', env.SUPABASE_JWT_SECRET).update(code).digest('hex')
const codeExpiresAt = () => new Date(Date.now() + AUTH.passwordResetMinutes * 60 * 1000).toISOString()

export async function login(email: string, password: string) {
  const normalizedEmail = email.toLowerCase()
  const session: SupabaseAuthSession = await supabaseAuth.signInWithPassword(normalizedEmail, password)

  const user = await findUserById(session.user.id)
  if (!user) throw unauthorized('Please verify your email before signing in.')
  if (!user.emailVerifiedAt) throw unauthorized('Please verify your email before signing in.')

  return toAuthResponse(user, session.access_token)
}

export async function register(name: string, email: string, password: string) {
  const normalizedEmail = email.toLowerCase()
  const existing = await findUserByEmail(normalizedEmail)
  if (existing?.emailVerifiedAt) throw conflict('An account with this email already exists.')

  const supabaseResponse = existing ? null : await supabaseAuth.signUpWithPassword(normalizedEmail, password, name)
  const supabaseUser = supabaseResponse ? ('user' in supabaseResponse ? supabaseResponse.user : supabaseResponse) : null
  if (!existing && (!supabaseUser?.id || !supabaseUser.email)) throw badRequest('Authentication request failed. Please try again.')
  const now = nowIso()
  const user = existing ?? await createUser({
    id: supabaseUser!.id!,
    email: supabaseUser!.email!,
    name,
    avatar: null,
    emailVerifiedAt: null,
    createdAt: now,
    updatedAt: now,
  })
  if (existing) {
    await supabaseAuth.updateUserPassword(existing.id, password)
    await updateUser(existing.id, { name, updatedAt: now })
  }

  const code = createSixDigitCode()
  await clearEmailVerificationCodes(user.id)
  await createEmailVerificationCode({
    id: crypto.randomUUID(),
    userId: user.id,
    code: hashCode(code),
    expiresAt: codeExpiresAt(),
    usedAt: null,
    createdAt: nowIso(),
  })
  await sendEmailVerificationCodeEmail({ email: normalizedEmail, name: user.name, code })
  return { success: true, email: normalizedEmail, ...(env.isDevelopment ? { debugCode: code } : {}) }
}

export async function resendEmailVerificationCode(email: string) {
  const normalizedEmail = email.toLowerCase()
  const user = await findUserByEmail(normalizedEmail)
  if (!user || user.emailVerifiedAt) return { success: true }
  const code = createSixDigitCode()
  await clearEmailVerificationCodes(user.id)
  await createEmailVerificationCode({
    id: crypto.randomUUID(),
    userId: user.id,
    code: hashCode(code),
    expiresAt: codeExpiresAt(),
    usedAt: null,
    createdAt: nowIso(),
  })
  await sendEmailVerificationCodeEmail({ email: normalizedEmail, name: user.name, code })
  return { success: true, ...(env.isDevelopment ? { debugCode: code } : {}) }
}

export async function verifyEmailRegistration(email: string, code: string) {
  const normalizedEmail = email.toLowerCase()
  const user = await findUserByEmail(normalizedEmail)
  if (!user) throw badRequest('Invalid or expired verification code.')
  if (user.emailVerifiedAt) return { success: true }
  const verificationCode = await findValidEmailVerificationCode(user.id, hashCode(code), nowIso())
  if (!verificationCode) {
    await incrementEmailVerificationCodeAttempts(user.id)
    throw badRequest('Invalid or expired verification code.')
  }
  const verifiedAt = nowIso()
  await markEmailVerificationCodeUsed(verificationCode.id, verifiedAt)
  await updateUser(user.id, { emailVerifiedAt: verifiedAt, updatedAt: verifiedAt })
  await sendWelcomeEmail({ email: normalizedEmail, name: user.name })
  return { success: true }
}

export async function getCurrentUser(userId: string) {
  const user = await findUserById(userId)
  if (!user) throw unauthorized('Authenticated user profile was not found.')
  return toAuthUser(user)
}

export async function createPasswordResetCode(email: string) {
  const user = await findUserByEmail(email.toLowerCase())
  if (!user) return { success: true }
  await clearResetCodes(user.id)
  const code = createSixDigitCode()
  await createResetCode({
    id: crypto.randomUUID(),
    userId: user.id,
    code: hashCode(code),
    expiresAt: codeExpiresAt(),
    usedAt: null,
    createdAt: nowIso(),
  })
  await sendPasswordResetCodeEmail({ code, email: user.email, name: user.name })
  return { success: true, ...(env.isDevelopment ? { debugCode: code } : {}) }
}

export async function verifyPasswordResetCode(email: string, code: string) {
  const user = await findUserByEmail(email.toLowerCase())
  if (!user) throw badRequest('Invalid or expired verification code.')
  const resetCode = await findValidResetCode(user.id, hashCode(code), nowIso())
  if (!resetCode) {
    await incrementResetCodeAttempts(user.id)
    throw badRequest('Invalid or expired verification code.')
  }
  return { success: true }
}

export async function resetPassword(email: string, code: string, password: string) {
  const user = await findUserByEmail(email.toLowerCase())
  if (!user) throw badRequest('Invalid or expired verification code.')
  const resetCode = await findValidResetCode(user.id, hashCode(code), nowIso())
  if (!resetCode) {
    await incrementResetCodeAttempts(user.id)
    throw badRequest('Invalid or expired verification code.')
  }

  await supabaseAuth.updateUserPassword(user.id, password)
  await markResetCodeUsed(resetCode.id, nowIso())
  await sendPasswordChangedEmail({ email: user.email, name: user.name })
  return { success: true }
}
