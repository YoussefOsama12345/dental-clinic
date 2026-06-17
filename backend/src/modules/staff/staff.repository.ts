import { and, asc, eq, like, ne, or, type SQL } from 'drizzle-orm'
import { db } from '../../config/database.config'
import { dentists } from '../dentists/dentists.model'
import { staff, type StaffInsert } from './staff.model'

export interface StaffListFilters {
  clinicId: string
  search?: string
  role?: string
  active?: string
}

function buildStaffFilters({ clinicId, search, role, active }: StaffListFilters): SQL[] {
  const filters: SQL[] = [eq(staff.clinicId, clinicId)]
  if (role) filters.push(eq(staff.role, role))
  if (active === 'true') filters.push(ne(staff.status, 'inactive'))
  if (search?.trim()) {
    const term = `%${search.trim()}%`
    filters.push(or(like(staff.fullName, term), like(staff.email, term))!)
  }
  return filters
}

export async function listStaff(filters: StaffListFilters) {
  const clauses = buildStaffFilters(filters)
  return db.select().from(staff).where(clauses.length ? and(...clauses) : undefined).orderBy(asc(staff.fullName))
}

export async function findStaffById(clinicId: string, id: string) {
  const [row] = await db.select().from(staff).where(and(eq(staff.clinicId, clinicId), eq(staff.id, id))).limit(1)
  return row ?? null
}

export async function createStaff(data: StaffInsert) {
  const [row] = await db.insert(staff).values(data).returning()
  return row
}

export async function updateStaff(clinicId: string, id: string, data: Partial<StaffInsert>) {
  const [row] = await db.update(staff).set(data).where(and(eq(staff.clinicId, clinicId), eq(staff.id, id))).returning()
  return row ?? null
}

export async function listRosterDentists(clinicId: string) {
  return db.select().from(dentists).where(eq(dentists.clinicId, clinicId)).orderBy(asc(dentists.fullName))
}
