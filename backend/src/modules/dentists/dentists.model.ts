import { boolean, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from '../auth/auth.model'

const time = (name: string) => timestamp(name, { withTimezone: true, mode: 'string' }).notNull()

export const dentists = pgTable('dentists', {
  id: uuid('id').primaryKey(),
  clinicId: uuid('clinic_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  specialty: text('specialty'),
  licenseNumber: text('license_number'),
  phone: text('phone'),
  email: text('email'),
  color: text('color'),
  yearsExperience: integer('years_experience'),
  qualificationsJson: text('qualifications_json').notNull().default('[]'),
  bio: text('bio'),
  workingDaysJson: text('working_days_json').notNull().default('[]'),
  workStart: text('work_start'),
  workEnd: text('work_end'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: time('created_at'),
  updatedAt: time('updated_at'),
}, (table) => ({
  clinicIdx: index('dentists_clinic_id_idx').on(table.clinicId),
}))

export type DentistModel = typeof dentists.$inferSelect
export type DentistInsert = typeof dentists.$inferInsert
