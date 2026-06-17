import { and, asc, count, eq, like, ne, or, type SQL } from 'drizzle-orm'
import { db } from '../../config/database.config'
import { patients, type PatientInsert } from './patients.model'

export interface PatientListFilters {
  clinicId: string
  search?: string
  status?: string
  dentistId?: string
}

function buildFilters({ clinicId, search, status, dentistId }: PatientListFilters): SQL[] {
  const filters: SQL[] = [eq(patients.clinicId, clinicId)]
  if (dentistId) filters.push(eq(patients.primaryDentistId, dentistId))
  if (status === 'all') {
    // keep all
  } else if (status) {
    filters.push(eq(patients.status, status))
  } else {
    filters.push(ne(patients.status, 'archived'))
  }
  if (search?.trim()) {
    const term = `%${search.trim()}%`
    filters.push(or(like(patients.firstName, term), like(patients.lastName, term), like(patients.phone, term), like(patients.email, term))!)
  }
  return filters
}

export async function listPatients(filters: PatientListFilters, page: number, pageSize: number) {
  const where = and(...buildFilters(filters))
  const [totalRows, rows] = await Promise.all([
    db.select({ value: count() }).from(patients).where(where),
    db.select().from(patients).where(where).orderBy(asc(patients.lastName), asc(patients.firstName)).limit(pageSize).offset((page - 1) * pageSize),
  ])
  return { total: totalRows[0]?.value ?? 0, rows }
}

export async function findPatientById(clinicId: string, id: string) {
  const [row] = await db.select().from(patients).where(and(eq(patients.clinicId, clinicId), eq(patients.id, id))).limit(1)
  return row ?? null
}

export async function createPatient(data: PatientInsert) {
  const [row] = await db.insert(patients).values(data).returning()
  return row
}

export async function updatePatient(clinicId: string, id: string, data: Partial<PatientInsert>) {
  const [row] = await db.update(patients).set(data).where(and(eq(patients.clinicId, clinicId), eq(patients.id, id))).returning()
  return row ?? null
}
