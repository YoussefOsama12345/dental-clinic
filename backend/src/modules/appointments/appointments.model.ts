import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from '../auth/auth.model'
import { dentists } from '../dentists/dentists.model'
import { patients } from '../patients/patients.model'

const time = (name: string) => timestamp(name, { withTimezone: true, mode: 'string' }).notNull()

export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey(),
  clinicId: uuid('clinic_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  dentistId: uuid('dentist_id').notNull().references(() => dentists.id, { onDelete: 'cascade' }),
  startsAt: time('starts_at'),
  endsAt: time('ends_at'),
  status: text('status').notNull(),
  type: text('type'),
  room: text('room'),
  reason: text('reason'),
  notes: text('notes'),
  cancellationReason: text('cancellation_reason'),
  outcome: text('outcome'),
  fee: text('fee'),
  createdAt: time('created_at'),
  updatedAt: time('updated_at'),
}, (table) => ({
  clinicIdx: index('appointments_clinic_id_idx').on(table.clinicId),
  clinicDentistStartsIdx: index('appointments_clinic_dentist_starts_idx').on(table.clinicId, table.dentistId, table.startsAt),
  clinicPatientIdx: index('appointments_clinic_patient_idx').on(table.clinicId, table.patientId),
  clinicStatusIdx: index('appointments_clinic_status_idx').on(table.clinicId, table.status),
}))

export type AppointmentModel = typeof appointments.$inferSelect
export type AppointmentInsert = typeof appointments.$inferInsert
