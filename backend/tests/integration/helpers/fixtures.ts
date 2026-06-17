import { randomUUID } from 'node:crypto'
import { db } from '../../../src/config/database.config'
import { dentists } from '../../../src/modules/dentists/dentists.model'
import { patients } from '../../../src/modules/patients/patients.model'
import { staff } from '../../../src/modules/staff/staff.model'
import { appointments } from '../../../src/modules/appointments/appointments.model'

const now = () => new Date().toISOString()

export async function seedDentist(over: Partial<typeof dentists.$inferInsert> = {}) {
  const id = over.id ?? randomUUID()
  const [row] = await db
    .insert(dentists)
    .values({
      id,
      fullName: 'Dr. Test',
      specialty: 'General',
      licenseNumber: 'LIC-TEST',
      phone: null,
      email: null,
      color: '#04CF9E',
      yearsExperience: 5,
      qualificationsJson: '[]',
      bio: null,
      workingDaysJson: '[]',
      workStart: '09:00',
      workEnd: '17:00',
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
      ...over,
    })
    .returning()
  return row
}

export async function seedPatient(over: Partial<typeof patients.$inferInsert> = {}) {
  const id = over.id ?? randomUUID()
  const [row] = await db
    .insert(patients)
    .values({
      id,
      firstName: 'John',
      lastName: 'Doe',
      gender: 'male',
      dateOfBirth: null,
      phone: null,
      email: null,
      address: null,
      bloodType: null,
      allergiesJson: '[]',
      chronicConditionsJson: '[]',
      medicationsJson: '[]',
      smoker: false,
      medicalNotes: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      primaryDentistId: null,
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
      ...over,
    })
    .returning()
  return row
}

export async function seedStaff(over: Partial<typeof staff.$inferInsert> = {}) {
  const id = over.id ?? randomUUID()
  const [row] = await db
    .insert(staff)
    .values({
      id,
      fullName: 'Jane Roe',
      role: 'reception',
      phone: null,
      email: null,
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
      ...over,
    })
    .returning()
  return row
}

export async function seedAppointment(
  patientId: string,
  dentistId: string,
  over: Partial<typeof appointments.$inferInsert> = {},
) {
  const id = over.id ?? randomUUID()
  const [row] = await db
    .insert(appointments)
    .values({
      id,
      patientId,
      dentistId,
      startsAt: '2025-06-01T09:00:00.000Z',
      endsAt: '2025-06-01T10:00:00.000Z',
      status: 'scheduled',
      reason: null,
      notes: null,
      createdAt: now(),
      updatedAt: now(),
      ...over,
    })
    .returning()
  return row
}
