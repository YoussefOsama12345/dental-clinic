import 'dotenv/config'
import { createHash } from 'node:crypto'
import { count } from 'drizzle-orm'
import { appointments, dentists, patients, staff, users } from './database.schema'
import { databasePool, db } from './config/database.config'
import { nowIso } from './utils/date'
import { stringifyJsonArray } from './utils/json'

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
const COLORS = ['#04CF9E', '#0E9B79', '#34D7AC', '#03B589', '#067356', '#6EE7C7'] as const
const REASONS = ['Routine checkup', 'Follow-up visit', 'Teeth cleaning', 'Tooth pain evaluation', 'Braces adjustment', 'Root canal follow-up'] as const
const FIRST_NAMES = ['Ahmed', 'Sara', 'Omar', 'Lina', 'Khaled', 'Mona', 'Yousef', 'Aisha', 'Fatima', 'Hassan', 'Dana', 'Salma'] as const
const LAST_NAMES = ['Hassan', 'Farouk', 'Rahman', 'Saleh', 'Nasser', 'Aziz', 'Mansour', 'Patel', 'Chen', 'Al-Harbi'] as const

let seed = 20260612

function rand(): number {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const pick = <T,>(items: readonly T[]): T => items[Math.floor(rand() * items.length)]
const chance = (value: number): boolean => rand() < value
const stableUuid = (label: string): string => {
  const hash = createHash('sha256').update(label).digest('hex')
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-${((parseInt(hash[16] ?? '0', 16) & 0x3) | 0x8).toString(16)}${hash.slice(17, 20)}-${hash.slice(20, 32)}`
}
const uid = (prefix: string, index: number): string => stableUuid(`${prefix}_${index}`)
const daysFromNow = (offset: number, hour: number, minute = 0): string => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + offset)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}
const randomPhone = (): string => `+966 5${Math.floor(rand() * 10)} ${Math.floor(100 + rand() * 900)} ${String(Math.floor(rand() * 10000)).padStart(4, '0')}`

export async function seedDatabase() {
  const [{ value: existing }] = await db.select({ value: count() }).from(dentists)
  if ((existing ?? 0) > 0) return

  const createdAt = nowIso()
  const clinicId = stableUuid('seed_clinic_owner')
  await db.insert(users).values({
    id: clinicId,
    email: 'owner@dentai.local',
    name: 'Clinic Owner',
    avatar: null,
    emailVerifiedAt: createdAt,
    createdAt,
    updatedAt: createdAt,
  }).onConflictDoNothing()

  const dentistRows = [
    [stableUuid('dt_sarah'), 'Dr. Sarah Mitchell', 'General Dentistry'],
    [stableUuid('dt_omar'), 'Dr. Omar Hassan', 'Orthodontics'],
    [stableUuid('dt_lina'), 'Dr. Lina Farouk', 'Pediatric Dentistry'],
    [stableUuid('dt_khaled'), 'Dr. Khaled Mansour', 'Endodontics'],
    [stableUuid('dt_james'), 'Dr. James Patel', 'Oral Surgery'],
    [stableUuid('dt_emily'), 'Dr. Emily Chen', 'General Dentistry'],
  ] as const

  await db.insert(dentists).values(dentistRows.map(([id, fullName, specialty], index) => ({
    id,
    clinicId,
    fullName,
    specialty,
    licenseNumber: `LIC-${1000 + index}`,
    phone: randomPhone(),
    email: `${fullName.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '')}@dentai.local`,
    color: COLORS[index % COLORS.length],
    yearsExperience: 6 + index * 2,
    qualificationsJson: stringifyJsonArray([`BDS - ${specialty}`, `${specialty} certification`]),
    bio: `${specialty} specialist focused on thoughtful, high-quality patient care.`,
    workingDaysJson: stringifyJsonArray(DAY_KEYS.filter((_, dayIndex) => dayIndex !== index % DAY_KEYS.length)),
    workStart: '09:00',
    workEnd: '17:00',
    isActive: true,
    createdAt,
    updatedAt: createdAt,
  })))

  await db.insert(staff).values([
    [uid('st', 1), 'Mona Saleh', 'reception', 'active'],
    [uid('st', 2), 'Huda Nasser', 'nurse', 'active'],
    [uid('st', 3), 'Majed Aziz', 'manager', 'active'],
    [uid('st', 4), 'Rana Tariq', 'reception', 'active'],
    [uid('st', 5), 'Bandar Salem', 'assistant', 'active'],
    [uid('st', 6), 'Ghada Noor', 'nurse', 'on_leave'],
  ].map(([id, fullName, role, status]) => ({
    id,
    clinicId,
    fullName,
    role,
    phone: randomPhone(),
    email: `${fullName.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '')}@dentai.local`,
    status,
    createdAt,
    updatedAt: createdAt,
  })))

  const dentistIds = dentistRows.map(([id]) => id)
  const patientRows = Array.from({ length: 54 }).map((_, index) => {
    const firstName = pick(FIRST_NAMES)
    const lastName = pick(LAST_NAMES)
    const timestamp = daysFromNow(-90 + Math.floor(rand() * 80), 10)
    return {
      id: uid('pt', index + 1),
      clinicId,
      firstName,
      lastName,
      gender: chance(0.5) ? 'male' : 'female',
      dateOfBirth: `${1968 + (index % 35)}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`,
      phone: randomPhone(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index + 1}@example.com`.replace(/[^a-z0-9.@]/g, ''),
      address: `${index + 10} Olaya Street, Riyadh`,
      bloodType: pick(['A+', 'A-', 'B+', 'O+', 'O-', 'AB+'] as const),
      allergiesJson: stringifyJsonArray(chance(0.3) ? ['Penicillin'] : []),
      chronicConditionsJson: stringifyJsonArray(chance(0.22) ? ['Hypertension'] : []),
      medicationsJson: stringifyJsonArray(chance(0.18) ? ['Metformin'] : []),
      smoker: chance(0.16),
      medicalNotes: chance(0.25) ? 'Needs gentle chairside communication.' : null,
      emergencyContactName: chance(0.7) ? `${pick(FIRST_NAMES)} ${lastName}` : null,
      emergencyContactPhone: chance(0.7) ? randomPhone() : null,
      primaryDentistId: pick(dentistIds),
      status: index % 11 === 0 ? 'inactive' : index % 17 === 0 ? 'archived' : 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    }
  })

  await db.insert(patients).values(patientRows)

  let appointmentIndex = 1
  const activePatients = patientRows.filter((row) => row.status !== 'archived')
  const appointmentRows = dentistRows.flatMap(([dentistId], dentistIndex) => {
    const rows = [] as Array<typeof appointments.$inferInsert>
    for (let day = -10; day <= 10; day += 1) {
      const maxSlots = day < 0 ? 2 : 3
      for (let slot = 0; slot < maxSlots; slot += 1) {
        const startsAt = daysFromNow(day, 9 + slot * 2, dentistIndex % 2 === 0 ? 0 : 30)
        const endsAt = new Date(new Date(startsAt).getTime() + 45 * 60 * 1000).toISOString()
        const patient = activePatients[(appointmentIndex + slot + dentistIndex) % activePatients.length]
        const status = day < -1 ? (slot % 5 === 0 ? 'completed' : 'confirmed') : day < 0 ? 'completed' : day === 0 ? (slot === 0 ? 'checked_in' : 'scheduled') : 'scheduled'
        rows.push({
          id: uid('ap', appointmentIndex),
          clinicId,
          patientId: patient.id,
          dentistId,
          startsAt,
          endsAt,
          status,
          reason: REASONS[(appointmentIndex + slot) % REASONS.length],
          notes: slot === 0 && day >= 0 ? 'Bring prior x-rays if available.' : null,
          createdAt: new Date(new Date(startsAt).getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(new Date(startsAt).getTime() - 24 * 60 * 60 * 1000).toISOString(),
        })
        appointmentIndex += 1
      }
    }
    return rows
  })

  await db.insert(appointments).values(appointmentRows)
}

await seedDatabase()
await databasePool.end()
