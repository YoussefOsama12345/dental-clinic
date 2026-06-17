import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from '../auth/auth.model'
import { dentists } from '../dentists/dentists.model'

const time = (name: string) => timestamp(name, { withTimezone: true, mode: 'string' }).notNull()

export const patients = pgTable('patients', {
  id: uuid('id').primaryKey(),
  clinicId: uuid('clinic_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  gender: text('gender').notNull(),
  dateOfBirth: text('date_of_birth'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  bloodType: text('blood_type'),
  allergiesJson: text('allergies_json').notNull().default('[]'),
  chronicConditionsJson: text('chronic_conditions_json').notNull().default('[]'),
  medicationsJson: text('medications_json').notNull().default('[]'),
  smoker: boolean('smoker').notNull().default(false),
  medicalNotes: text('medical_notes'),
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactPhone: text('emergency_contact_phone'),
  primaryDentistId: uuid('primary_dentist_id').references(() => dentists.id, { onDelete: 'set null' }),
  status: text('status').notNull(),
  createdAt: time('created_at'),
  updatedAt: time('updated_at'),
}, (table) => ({
  clinicIdx: index('patients_clinic_id_idx').on(table.clinicId),
  clinicDentistIdx: index('patients_clinic_dentist_idx').on(table.clinicId, table.primaryDentistId),
  clinicStatusIdx: index('patients_clinic_status_idx').on(table.clinicId, table.status),
}))

export type PatientModel = typeof patients.$inferSelect
export type PatientInsert = typeof patients.$inferInsert
