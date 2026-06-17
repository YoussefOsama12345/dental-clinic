import { parseJsonArray } from '../../utils/json'
import type { StaffModel } from './staff.model'

export const toStaff = (row: StaffModel) => ({
  id: row.id,
  fullName: row.fullName,
  role: row.role,
  phone: row.phone,
  email: row.email,
  status: row.status,
  workingDays: parseJsonArray(row.workingDaysJson),
  workStart: row.workStart,
  workEnd: row.workEnd,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})
