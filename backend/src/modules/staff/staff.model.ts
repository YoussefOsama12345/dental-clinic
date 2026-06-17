import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from '../auth/auth.model'

const time = (name: string) => timestamp(name, { withTimezone: true, mode: 'string' }).notNull()

export const staff = pgTable('staff', {
  id: uuid('id').primaryKey(),
  clinicId: uuid('clinic_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  role: text('role').notNull(),
  phone: text('phone'),
  email: text('email'),
  status: text('status').notNull(),
  workingDaysJson: text('working_days_json').notNull().default('[]'),
  workStart: text('work_start'),
  workEnd: text('work_end'),
  createdAt: time('created_at'),
  updatedAt: time('updated_at'),
}, (table) => ({
  clinicIdx: index('staff_clinic_id_idx').on(table.clinicId),
}))

export type StaffModel = typeof staff.$inferSelect
export type StaffInsert = typeof staff.$inferInsert
