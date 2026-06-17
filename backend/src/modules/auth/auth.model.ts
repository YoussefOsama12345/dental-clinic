import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

const time = (name: string) => timestamp(name, { withTimezone: true, mode: 'string' }).notNull()

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true, mode: 'string' }),
  createdAt: time('created_at'),
  updatedAt: time('updated_at'),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
}))

export const passwordResetCodes = pgTable('password_reset_codes', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  attempts: integer('attempts').notNull().default(0),
  expiresAt: time('expires_at'),
  usedAt: timestamp('used_at', { withTimezone: true, mode: 'string' }),
  createdAt: time('created_at'),
}, (table) => ({
  userCodeIdx: index('password_reset_codes_user_code_idx').on(table.userId, table.code),
}))

export const emailVerificationCodes = pgTable('email_verification_codes', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  attempts: integer('attempts').notNull().default(0),
  expiresAt: time('expires_at'),
  usedAt: timestamp('used_at', { withTimezone: true, mode: 'string' }),
  createdAt: time('created_at'),
}, (table) => ({
  userCodeIdx: index('email_verification_codes_user_code_idx').on(table.userId, table.code),
}))

export type AuthProfileModel = typeof users.$inferSelect
export type AuthProfileInsert = typeof users.$inferInsert
export type PasswordResetCodeModel = typeof passwordResetCodes.$inferSelect
export type PasswordResetCodeInsert = typeof passwordResetCodes.$inferInsert
export type EmailVerificationCodeModel = typeof emailVerificationCodes.$inferSelect
export type EmailVerificationCodeInsert = typeof emailVerificationCodes.$inferInsert

export interface SupabaseAuthUser {
  id: string
  email: string
  user_metadata?: { name?: string }
}

export interface SupabaseAuthSession {
  access_token: string
  user: SupabaseAuthUser
}

export interface SupabaseSignUpResponse {
  user?: SupabaseAuthUser
  id?: string
  email?: string
  user_metadata?: { name?: string }
}
