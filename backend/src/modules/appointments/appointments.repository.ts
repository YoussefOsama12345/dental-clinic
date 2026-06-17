import { and, asc, eq, gt, inArray, lt, ne, sql, type SQL } from 'drizzle-orm'
import { db } from '../../config/database.config'
import { appointments, type AppointmentInsert } from './appointments.model'

export interface AppointmentListFilters {
  clinicId: string
  from?: string
  to?: string
  dentistId?: string
  patientId?: string
  status?: string
}

function buildFilters({ clinicId, from, to, dentistId, patientId, status }: AppointmentListFilters): SQL[] {
  const filters: SQL[] = [eq(appointments.clinicId, clinicId)]
  if (dentistId) filters.push(eq(appointments.dentistId, dentistId))
  if (patientId) filters.push(eq(appointments.patientId, patientId))
  if (status) filters.push(eq(appointments.status, status))
  if (from) filters.push(gt(appointments.endsAt, from))
  if (to) filters.push(lt(appointments.startsAt, to))
  return filters
}

export async function listAppointments(filters: AppointmentListFilters) {
  const clauses = buildFilters(filters)
  return db.select().from(appointments).where(clauses.length ? and(...clauses) : undefined).orderBy(asc(appointments.startsAt))
}

export async function findAppointmentById(clinicId: string, id: string) {
  const [row] = await db.select().from(appointments).where(and(eq(appointments.clinicId, clinicId), eq(appointments.id, id))).limit(1)
  return row ?? null
}

export async function findAppointmentConflict(clinicId: string, dentistId: string, from: string, to: string, statuses: readonly string[], excludeId?: string) {
  const clauses: SQL[] = [eq(appointments.clinicId, clinicId), eq(appointments.dentistId, dentistId), inArray(appointments.status, statuses), lt(appointments.startsAt, to), gt(appointments.endsAt, from)]
  if (excludeId) clauses.push(ne(appointments.id, excludeId))
  const [row] = await db.select().from(appointments).where(and(...clauses)).limit(1)
  return row ?? null
}

const conflictClauses = (clinicId: string, dentistId: string, from: string, to: string, statuses: readonly string[], excludeId?: string): SQL[] => {
  const clauses: SQL[] = [eq(appointments.clinicId, clinicId), eq(appointments.dentistId, dentistId), inArray(appointments.status, statuses), lt(appointments.startsAt, to), gt(appointments.endsAt, from)]
  if (excludeId) clauses.push(ne(appointments.id, excludeId))
  return clauses
}

const appointmentLockKey = (clinicId: string, dentistId: string) => `${clinicId}:${dentistId}`

export async function createAppointment(data: AppointmentInsert) {
  const [row] = await db.insert(appointments).values(data).returning()
  return row
}

export async function createAppointmentWithConflictGuard(data: AppointmentInsert, statuses: readonly string[]) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${appointmentLockKey(data.clinicId, data.dentistId)}))`)
    const [conflict] = await tx.select().from(appointments).where(and(...conflictClauses(data.clinicId, data.dentistId, data.startsAt, data.endsAt, statuses))).limit(1)
    if (conflict) return { row: null, conflict }
    const [row] = await tx.insert(appointments).values(data).returning()
    return { row, conflict: null }
  })
}

export async function updateAppointment(clinicId: string, id: string, data: Partial<AppointmentInsert>) {
  const [row] = await db.update(appointments).set(data).where(and(eq(appointments.clinicId, clinicId), eq(appointments.id, id))).returning()
  return row ?? null
}

export async function updateAppointmentWithConflictGuard(clinicId: string, id: string, data: Partial<AppointmentInsert>, dentistId: string, startsAt: string, endsAt: string, statuses: readonly string[]) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${appointmentLockKey(clinicId, dentistId)}))`)
    const [conflict] = await tx.select().from(appointments).where(and(...conflictClauses(clinicId, dentistId, startsAt, endsAt, statuses, id))).limit(1)
    if (conflict) return { row: null, conflict }
    const [row] = await tx.update(appointments).set(data).where(and(eq(appointments.clinicId, clinicId), eq(appointments.id, id))).returning()
    return { row: row ?? null, conflict: null }
  })
}
