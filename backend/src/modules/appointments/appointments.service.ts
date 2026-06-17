import { BLOCKING_APPOINTMENT_STATUSES } from '../../constants/domain.constants'
import { badRequest, conflict, notFound } from '../../utils/app-error'
import { nowIso } from '../../utils/date'
import { toAppointment } from './appointments.dto'
import { findDentistById } from '../dentists/dentists.repository'
import { findPatientById } from '../patients/patients.repository'
import { createAppointmentWithConflictGuard, findAppointmentById, findAppointmentConflict, listAppointments, type AppointmentListFilters, updateAppointment, updateAppointmentWithConflictGuard } from './appointments.repository'

export async function listAppointmentsService(clinicId: string, query: Omit<AppointmentListFilters, 'clinicId'>) {
  return (await listAppointments({ clinicId, ...query })).map(toAppointment)
}

export async function getAppointmentById(clinicId: string, id: string) {
  const appointment = await findAppointmentById(clinicId, id)
  if (!appointment) throw notFound('Appointment not found.')
  return toAppointment(appointment)
}

export async function checkAppointmentAvailability(clinicId: string, dentistId: string, from: string, to: string, excludeAppointmentId?: string) {
  const dentist = await findDentistById(clinicId, dentistId)
  if (!dentist) throw notFound('Dentist not found.')
  const conflictRow = await findAppointmentConflict(clinicId, dentistId, from, to, BLOCKING_APPOINTMENT_STATUSES, excludeAppointmentId)
  return { available: !conflictRow, conflictId: conflictRow?.id ?? null }
}

export async function createAppointmentService(clinicId: string, payload: Record<string, unknown>) {
  const startsAt = String(payload.startsAt)
  const endsAt = String(payload.endsAt)
  if (new Date(endsAt) <= new Date(startsAt)) throw badRequest('End time must be after start time.')
  const patient = await findPatientById(clinicId, String(payload.patientId))
  if (!patient) throw notFound('Patient not found.')
  const dentist = await findDentistById(clinicId, String(payload.dentistId))
  if (!dentist) throw notFound('Dentist not found.')
  const now = nowIso()
  const { row, conflict: conflictRow } = await createAppointmentWithConflictGuard({
    id: crypto.randomUUID(),
    clinicId,
    patientId: String(payload.patientId),
    dentistId: String(payload.dentistId),
    startsAt,
    endsAt,
    status: String(payload.status ?? 'scheduled'),
    type: payload.type ? String(payload.type) : null,
    room: payload.room ? String(payload.room) : null,
    reason: payload.reason ? String(payload.reason) : null,
    notes: payload.notes ? String(payload.notes) : null,
    cancellationReason: payload.cancellationReason ? String(payload.cancellationReason) : null,
    outcome: payload.outcome ? String(payload.outcome) : null,
    fee: payload.fee !== undefined && payload.fee !== null && payload.fee !== '' ? String(payload.fee) : null,
    createdAt: now,
    updatedAt: now,
  }, BLOCKING_APPOINTMENT_STATUSES)
  if (conflictRow || !row) throw conflict('This dentist already has an appointment in that time range.', { conflictId: conflictRow?.id })
  return toAppointment(row)
}

export async function updateAppointmentService(clinicId: string, id: string, payload: Record<string, unknown>) {
  const current = await findAppointmentById(clinicId, id)
  if (!current) throw notFound('Appointment not found.')

  const startsAt = payload.startsAt ? String(payload.startsAt) : current.startsAt
  const endsAt = payload.endsAt ? String(payload.endsAt) : current.endsAt
  if (new Date(endsAt) <= new Date(startsAt)) throw badRequest('End time must be after start time.')

  if (payload.patientId) {
    const patient = await findPatientById(clinicId, String(payload.patientId))
    if (!patient) throw notFound('Patient not found.')
  }
  const dentistId = payload.dentistId ? String(payload.dentistId) : current.dentistId
  const dentist = await findDentistById(clinicId, dentistId)
  if (!dentist) throw notFound('Dentist not found.')
  const status = payload.status ? String(payload.status) : current.status
  const updatePayload = {
    patientId: payload.patientId ? String(payload.patientId) : undefined,
    dentistId: payload.dentistId ? String(payload.dentistId) : undefined,
    startsAt,
    endsAt,
    status,
    type: payload.type !== undefined ? (payload.type ? String(payload.type) : null) : undefined,
    room: payload.room !== undefined ? (payload.room ? String(payload.room) : null) : undefined,
    reason: payload.reason !== undefined ? (payload.reason ? String(payload.reason) : null) : undefined,
    notes: payload.notes !== undefined ? (payload.notes ? String(payload.notes) : null) : undefined,
    cancellationReason: payload.cancellationReason !== undefined ? (payload.cancellationReason ? String(payload.cancellationReason) : null) : undefined,
    outcome: payload.outcome !== undefined ? (payload.outcome ? String(payload.outcome) : null) : undefined,
    fee: payload.fee !== undefined ? (payload.fee !== null && payload.fee !== '' ? String(payload.fee) : null) : undefined,
    updatedAt: nowIso(),
  }

  const updatedResult = BLOCKING_APPOINTMENT_STATUSES.includes(status as (typeof BLOCKING_APPOINTMENT_STATUSES)[number])
    ? await updateAppointmentWithConflictGuard(clinicId, id, updatePayload, dentistId, startsAt, endsAt, BLOCKING_APPOINTMENT_STATUSES)
    : { row: await updateAppointment(clinicId, id, updatePayload), conflict: null }
  if (updatedResult.conflict) throw conflict('This dentist already has an appointment in that time range.', { conflictId: updatedResult.conflict.id })
  if (!updatedResult.row) throw notFound('Appointment not found.')
  return toAppointment(updatedResult.row)
}

export async function cancelAppointment(clinicId: string, id: string) {
  const current = await findAppointmentById(clinicId, id)
  if (!current) throw notFound('Appointment not found.')
  await updateAppointment(clinicId, id, { status: 'cancelled', updatedAt: nowIso() })
  return { success: true }
}
