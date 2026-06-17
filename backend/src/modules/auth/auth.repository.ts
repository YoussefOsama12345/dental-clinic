import { and, desc, eq, gt, isNull, lt, sql } from 'drizzle-orm'
import { db } from '../../config/database.config'
import { emailVerificationCodes, passwordResetCodes, users, type AuthProfileInsert, type EmailVerificationCodeInsert, type PasswordResetCodeInsert } from './auth.model'

export async function findUserByEmail(email: string) {
  const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  return row ?? null
}

export async function findUserById(id: string) {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return row ?? null
}

export async function createUser(data: AuthProfileInsert) {
  const [row] = await db.insert(users).values(data).returning()
  return row
}

export async function updateUser(id: string, data: Partial<AuthProfileInsert>) {
  const [row] = await db.update(users).set(data).where(eq(users.id, id)).returning()
  return row ?? null
}

export async function clearResetCodes(userId: string) {
  await db.delete(passwordResetCodes).where(eq(passwordResetCodes.userId, userId))
}

export async function createResetCode(data: PasswordResetCodeInsert) {
  await db.insert(passwordResetCodes).values(data)
}

export async function findValidResetCode(userId: string, code: string, now: string) {
  const [row] = await db.select().from(passwordResetCodes)
    .where(and(eq(passwordResetCodes.userId, userId), eq(passwordResetCodes.code, code), isNull(passwordResetCodes.usedAt), gt(passwordResetCodes.expiresAt, now), lt(passwordResetCodes.attempts, 5)))
    .orderBy(desc(passwordResetCodes.createdAt))
    .limit(1)
  return row ?? null
}

export async function markResetCodeUsed(id: string, usedAt: string) {
  await db.update(passwordResetCodes).set({ usedAt }).where(eq(passwordResetCodes.id, id))
}

export async function incrementResetCodeAttempts(userId: string) {
  await db.update(passwordResetCodes).set({ attempts: sql`${passwordResetCodes.attempts} + 1` }).where(and(eq(passwordResetCodes.userId, userId), isNull(passwordResetCodes.usedAt)))
}

export async function clearEmailVerificationCodes(userId: string) {
  await db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.userId, userId))
}

export async function createEmailVerificationCode(data: EmailVerificationCodeInsert) {
  await db.insert(emailVerificationCodes).values(data)
}

export async function findValidEmailVerificationCode(userId: string, code: string, now: string) {
  const [row] = await db.select().from(emailVerificationCodes)
    .where(and(eq(emailVerificationCodes.userId, userId), eq(emailVerificationCodes.code, code), isNull(emailVerificationCodes.usedAt), gt(emailVerificationCodes.expiresAt, now), lt(emailVerificationCodes.attempts, 5)))
    .orderBy(desc(emailVerificationCodes.createdAt))
    .limit(1)
  return row ?? null
}

export async function markEmailVerificationCodeUsed(id: string, usedAt: string) {
  await db.update(emailVerificationCodes).set({ usedAt }).where(eq(emailVerificationCodes.id, id))
}

export async function incrementEmailVerificationCodeAttempts(userId: string) {
  await db.update(emailVerificationCodes).set({ attempts: sql`${emailVerificationCodes.attempts} + 1` }).where(and(eq(emailVerificationCodes.userId, userId), isNull(emailVerificationCodes.usedAt)))
}
