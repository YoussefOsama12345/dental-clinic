import { parseJsonArray } from '../../utils/json'
import type { DentistModel } from './dentists.model'

export const toDentist = (row: DentistModel) => ({
  id: row.id,
  fullName: row.fullName,
  specialty: row.specialty,
  licenseNumber: row.licenseNumber,
  phone: row.phone,
  email: row.email,
  color: row.color,
  yearsExperience: row.yearsExperience,
  qualifications: parseJsonArray(row.qualificationsJson),
  bio: row.bio,
  workingDays: parseJsonArray(row.workingDaysJson),
  workStart: row.workStart,
  workEnd: row.workEnd,
  isActive: Boolean(row.isActive),
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})
