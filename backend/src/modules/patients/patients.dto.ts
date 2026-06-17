import { parseJsonArray } from '../../utils/json'
import type { PatientModel } from './patients.model'

export const toPatient = (row: PatientModel) => ({
  id: row.id,
  firstName: row.firstName,
  lastName: row.lastName,
  gender: row.gender,
  dateOfBirth: row.dateOfBirth,
  phone: row.phone,
  email: row.email,
  address: row.address,
  bloodType: row.bloodType,
  allergies: parseJsonArray(row.allergiesJson),
  chronicConditions: parseJsonArray(row.chronicConditionsJson),
  medications: parseJsonArray(row.medicationsJson),
  smoker: Boolean(row.smoker),
  medicalNotes: row.medicalNotes,
  emergencyContactName: row.emergencyContactName,
  emergencyContactPhone: row.emergencyContactPhone,
  primaryDentistId: row.primaryDentistId,
  status: row.status,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})
