import { notFound } from '../../utils/app-error'
import { nowIso } from '../../utils/date'
import { stringifyJsonArray } from '../../utils/json'
import { findDentistById } from '../dentists/dentists.repository'
import { toPatient } from './patients.dto'
import { createPatient, findPatientById, listPatients, type PatientListFilters, updatePatient } from './patients.repository'

export async function listPatientsService(clinicId: string, query: Omit<PatientListFilters, 'clinicId'> & { page: number; pageSize: number }) {
  const result = await listPatients({ clinicId, search: query.search, status: query.status, dentistId: query.dentistId }, query.page, query.pageSize)
  return {
    data: result.rows.map(toPatient),
    total: result.total,
    page: query.page,
    pageSize: query.pageSize,
  }
}

export async function getPatientById(clinicId: string, id: string) {
  const patient = await findPatientById(clinicId, id)
  if (!patient) throw notFound('Patient not found.')
  return toPatient(patient)
}

export async function createPatientService(clinicId: string, payload: Record<string, unknown>) {
  const primaryDentistId = payload.primaryDentistId ? String(payload.primaryDentistId) : null
  if (primaryDentistId && !(await findDentistById(clinicId, primaryDentistId))) throw notFound('Dentist not found.')
  const now = nowIso()
  const created = await createPatient({
    id: crypto.randomUUID(),
    clinicId,
    firstName: String(payload.firstName ?? ''),
    lastName: String(payload.lastName ?? ''),
    gender: String(payload.gender ?? 'unspecified'),
    dateOfBirth: payload.dateOfBirth ? String(payload.dateOfBirth) : null,
    phone: payload.phone ? String(payload.phone) : null,
    email: payload.email ? String(payload.email) : null,
    address: payload.address ? String(payload.address) : null,
    bloodType: payload.bloodType ? String(payload.bloodType) : null,
    allergiesJson: stringifyJsonArray(payload.allergies as string[] | undefined),
    chronicConditionsJson: stringifyJsonArray(payload.chronicConditions as string[] | undefined),
    medicationsJson: stringifyJsonArray(payload.medications as string[] | undefined),
    smoker: Boolean(payload.smoker),
    medicalNotes: payload.medicalNotes ? String(payload.medicalNotes) : null,
    emergencyContactName: payload.emergencyContactName ? String(payload.emergencyContactName) : null,
    emergencyContactPhone: payload.emergencyContactPhone ? String(payload.emergencyContactPhone) : null,
    primaryDentistId,
    status: String(payload.status ?? 'active'),
    createdAt: now,
    updatedAt: now,
  })
  return toPatient(created)
}

export async function updatePatientService(clinicId: string, id: string, payload: Record<string, unknown>) {
  const existing = await findPatientById(clinicId, id)
  if (!existing) throw notFound('Patient not found.')
  const primaryDentistId = payload.primaryDentistId !== undefined ? (payload.primaryDentistId ? String(payload.primaryDentistId) : null) : undefined
  if (primaryDentistId && !(await findDentistById(clinicId, primaryDentistId))) throw notFound('Dentist not found.')
  const updated = await updatePatient(clinicId, id, {
    firstName: payload.firstName !== undefined ? String(payload.firstName) : undefined,
    lastName: payload.lastName !== undefined ? String(payload.lastName) : undefined,
    gender: payload.gender !== undefined ? String(payload.gender) : undefined,
    dateOfBirth: payload.dateOfBirth !== undefined ? (payload.dateOfBirth ? String(payload.dateOfBirth) : null) : undefined,
    phone: payload.phone !== undefined ? (payload.phone ? String(payload.phone) : null) : undefined,
    email: payload.email !== undefined ? (payload.email ? String(payload.email) : null) : undefined,
    address: payload.address !== undefined ? (payload.address ? String(payload.address) : null) : undefined,
    bloodType: payload.bloodType !== undefined ? (payload.bloodType ? String(payload.bloodType) : null) : undefined,
    allergiesJson: payload.allergies !== undefined ? stringifyJsonArray(payload.allergies as string[]) : undefined,
    chronicConditionsJson: payload.chronicConditions !== undefined ? stringifyJsonArray(payload.chronicConditions as string[]) : undefined,
    medicationsJson: payload.medications !== undefined ? stringifyJsonArray(payload.medications as string[]) : undefined,
    smoker: payload.smoker !== undefined ? Boolean(payload.smoker) : undefined,
    medicalNotes: payload.medicalNotes !== undefined ? (payload.medicalNotes ? String(payload.medicalNotes) : null) : undefined,
    emergencyContactName: payload.emergencyContactName !== undefined ? (payload.emergencyContactName ? String(payload.emergencyContactName) : null) : undefined,
    emergencyContactPhone: payload.emergencyContactPhone !== undefined ? (payload.emergencyContactPhone ? String(payload.emergencyContactPhone) : null) : undefined,
    primaryDentistId,
    status: payload.status !== undefined ? String(payload.status) : undefined,
    updatedAt: nowIso(),
  })
  if (!updated) throw notFound('Patient not found.')
  return toPatient(updated)
}

export async function archivePatient(clinicId: string, id: string) {
  const existing = await findPatientById(clinicId, id)
  if (!existing) throw notFound('Patient not found.')
  await updatePatient(clinicId, id, { status: 'archived', updatedAt: nowIso() })
  return { success: true }
}
