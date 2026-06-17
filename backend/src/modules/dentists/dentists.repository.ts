import { and, asc, eq, like, or, type SQL } from 'drizzle-orm'
import { db } from '../../config/database.config'
import { dentists, type DentistInsert } from './dentists.model'

export interface DentistListFilters {
  clinicId: string
  search?: string
  specialty?: string
  active?: string
}

function buildFilters({ clinicId, search, specialty, active }: DentistListFilters): SQL[] {
  const filters: SQL[] = [eq(dentists.clinicId, clinicId)]
  if (specialty) filters.push(eq(dentists.specialty, specialty))
  if (active === 'true') filters.push(eq(dentists.isActive, true))
  if (active === 'false') filters.push(eq(dentists.isActive, false))
  if (search?.trim()) {
    const term = `%${search.trim()}%`
    filters.push(or(like(dentists.fullName, term), like(dentists.specialty, term), like(dentists.email, term))!)
  }
  return filters
}

export async function listDentists(filters: DentistListFilters) {
  const clauses = buildFilters(filters)
  return db.select().from(dentists).where(clauses.length ? and(...clauses) : undefined).orderBy(asc(dentists.fullName))
}

export async function findDentistById(clinicId: string, id: string) {
  const [row] = await db.select().from(dentists).where(and(eq(dentists.clinicId, clinicId), eq(dentists.id, id))).limit(1)
  return row ?? null
}

export async function createDentist(data: DentistInsert) {
  const [row] = await db.insert(dentists).values(data).returning()
  return row
}

export async function updateDentist(clinicId: string, id: string, data: Partial<DentistInsert>) {
  const [row] = await db.update(dentists).set(data).where(and(eq(dentists.clinicId, clinicId), eq(dentists.id, id))).returning()
  return row ?? null
}
