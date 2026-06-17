import { notFound } from '../../utils/app-error'
import { nowIso } from '../../utils/date'
import { stringifyJsonArray } from '../../utils/json'
import { toStaff } from './staff.dto'
import { createStaff, findStaffById, listRosterDentists, listStaff, type StaffListFilters, updateStaff } from './staff.repository'

const roleLabel = (role: string) => {
  if (role === 'reception') return 'Reception'
  if (role === 'nurse') return 'Nurse'
  return role === 'manager' ? 'Manager' : role === 'assistant' ? 'Assistant' : role === 'accountant' ? 'Accountant' : role
}

export async function listStaffService(clinicId: string, query: Omit<StaffListFilters, 'clinicId'>) {
  return (await listStaff({ clinicId, ...query })).map(toStaff)
}

export async function listRoster(clinicId: string, query: { search?: string; role?: string }) {
  const dentistRows = await listRosterDentists(clinicId)
  const staffRows = await listStaff({ clinicId, search: query.search })
  return [
    ...dentistRows.map((dentist) => ({ id: dentist.id, kind: 'dentist', fullName: dentist.fullName, role: 'Doctor', phone: dentist.phone, email: dentist.email, status: dentist.isActive ? 'active' : 'inactive', workingDays: [], workStart: null, workEnd: null })),
    ...staffRows.map((member) => ({ id: member.id, kind: 'staff', fullName: member.fullName, role: roleLabel(member.role), phone: member.phone, email: member.email, status: member.status, workingDays: JSON.parse(member.workingDaysJson || '[]'), workStart: member.workStart, workEnd: member.workEnd })),
  ]
    .filter((item) => (query.role && query.role !== 'all' ? item.role.toLowerCase() === query.role.toLowerCase() : true))
    .filter((item) => (query.search ? item.fullName.toLowerCase().includes(query.search.toLowerCase()) : true))
}

export async function getStaffById(clinicId: string, id: string) {
  const member = await findStaffById(clinicId, id)
  if (!member) throw notFound('Staff not found.')
  return toStaff(member)
}

export async function createStaffService(clinicId: string, payload: Record<string, unknown>) {
  const now = nowIso()
  return toStaff(await createStaff({
    id: crypto.randomUUID(),
    clinicId,
    fullName: String(payload.fullName ?? ''),
    role: String(payload.role ?? 'reception'),
    phone: payload.phone ? String(payload.phone) : null,
    email: payload.email ? String(payload.email) : null,
    status: String(payload.status ?? 'active'),
    workingDaysJson: stringifyJsonArray(payload.workingDays as string[] | undefined),
    workStart: payload.workStart ? String(payload.workStart) : '09:00',
    workEnd: payload.workEnd ? String(payload.workEnd) : '17:00',
    createdAt: now,
    updatedAt: now,
  }))
}

export async function updateStaffService(clinicId: string, id: string, payload: Record<string, unknown>) {
  const existing = await findStaffById(clinicId, id)
  if (!existing) throw notFound('Staff not found.')
  const updated = await updateStaff(clinicId, id, {
    fullName: payload.fullName !== undefined ? String(payload.fullName) : undefined,
    role: payload.role !== undefined ? String(payload.role) : undefined,
    phone: payload.phone !== undefined ? (payload.phone ? String(payload.phone) : null) : undefined,
    email: payload.email !== undefined ? (payload.email ? String(payload.email) : null) : undefined,
    status: payload.status !== undefined ? String(payload.status) : undefined,
    workingDaysJson: payload.workingDays !== undefined ? stringifyJsonArray(payload.workingDays as string[]) : undefined,
    workStart: payload.workStart !== undefined ? (payload.workStart ? String(payload.workStart) : null) : undefined,
    workEnd: payload.workEnd !== undefined ? (payload.workEnd ? String(payload.workEnd) : null) : undefined,
    updatedAt: nowIso(),
  })
  if (!updated) throw notFound('Staff not found.')
  return toStaff(updated)
}

export async function deactivateStaff(clinicId: string, id: string) {
  const existing = await findStaffById(clinicId, id)
  if (!existing) throw notFound('Staff not found.')
  await updateStaff(clinicId, id, { status: 'inactive', updatedAt: nowIso() })
  return { success: true }
}
