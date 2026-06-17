import { notFound } from '../../utils/app-error'
import { nowIso } from '../../utils/date'
import { stringifyJsonArray } from '../../utils/json'
import { toDentist } from './dentists.dto'
import { createDentist, findDentistById, listDentists, updateDentist, type DentistListFilters } from './dentists.repository'

export async function listDentistsService(clinicId: string, query: Omit<DentistListFilters, 'clinicId'>) {
  return (await listDentists({ clinicId, ...query })).map(toDentist)
}

export async function getDentistById(clinicId: string, id: string) {
  const dentist = await findDentistById(clinicId, id)
  if (!dentist) throw notFound('Dentist not found.')
  return toDentist(dentist)
}

export async function createDentistService(clinicId: string, payload: Record<string, unknown>) {
  const now = nowIso()
  const created = await createDentist({
    id: crypto.randomUUID(),
    clinicId,
    fullName: String(payload.fullName ?? ''),
    specialty: payload.specialty ? String(payload.specialty) : null,
    licenseNumber: payload.licenseNumber ? String(payload.licenseNumber) : null,
    phone: payload.phone ? String(payload.phone) : null,
    email: payload.email ? String(payload.email) : null,
    color: payload.color ? String(payload.color) : '#04CF9E',
    yearsExperience: payload.yearsExperience ? Number(payload.yearsExperience) : null,
    qualificationsJson: stringifyJsonArray(payload.qualifications as string[] | undefined),
    bio: payload.bio ? String(payload.bio) : null,
    workingDaysJson: stringifyJsonArray(payload.workingDays as string[] | undefined),
    workStart: payload.workStart ? String(payload.workStart) : '09:00',
    workEnd: payload.workEnd ? String(payload.workEnd) : '17:00',
    isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
    createdAt: now,
    updatedAt: now,
  })
  return toDentist(created)
}

export async function updateDentistService(clinicId: string, id: string, payload: Record<string, unknown>) {
  const existing = await findDentistById(clinicId, id)
  if (!existing) throw notFound('Dentist not found.')
  const updated = await updateDentist(clinicId, id, {
    fullName: payload.fullName !== undefined ? String(payload.fullName) : undefined,
    specialty: payload.specialty !== undefined ? (payload.specialty ? String(payload.specialty) : null) : undefined,
    licenseNumber: payload.licenseNumber !== undefined ? (payload.licenseNumber ? String(payload.licenseNumber) : null) : undefined,
    phone: payload.phone !== undefined ? (payload.phone ? String(payload.phone) : null) : undefined,
    email: payload.email !== undefined ? (payload.email ? String(payload.email) : null) : undefined,
    color: payload.color !== undefined ? (payload.color ? String(payload.color) : null) : undefined,
    yearsExperience: payload.yearsExperience !== undefined ? (payload.yearsExperience ? Number(payload.yearsExperience) : null) : undefined,
    qualificationsJson: payload.qualifications !== undefined ? stringifyJsonArray(payload.qualifications as string[]) : undefined,
    bio: payload.bio !== undefined ? (payload.bio ? String(payload.bio) : null) : undefined,
    workingDaysJson: payload.workingDays !== undefined ? stringifyJsonArray(payload.workingDays as string[]) : undefined,
    workStart: payload.workStart !== undefined ? (payload.workStart ? String(payload.workStart) : null) : undefined,
    workEnd: payload.workEnd !== undefined ? (payload.workEnd ? String(payload.workEnd) : null) : undefined,
    isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : undefined,
    updatedAt: nowIso(),
  })
  if (!updated) throw notFound('Dentist not found.')
  return toDentist(updated)
}

export async function deactivateDentist(clinicId: string, id: string) {
  const existing = await findDentistById(clinicId, id)
  if (!existing) throw notFound('Dentist not found.')
  await updateDentist(clinicId, id, { isActive: false, updatedAt: nowIso() })
  return { success: true }
}
