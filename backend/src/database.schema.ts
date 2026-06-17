export { users, passwordResetCodes, emailVerificationCodes } from './modules/auth/auth.model'
export type { AuthProfileInsert as UserInsert, AuthProfileModel as UserRow, PasswordResetCodeInsert, PasswordResetCodeModel, EmailVerificationCodeInsert, EmailVerificationCodeModel } from './modules/auth/auth.model'

export { dentists } from './modules/dentists/dentists.model'
export type { DentistInsert, DentistModel as DentistRow } from './modules/dentists/dentists.model'

export { staff } from './modules/staff/staff.model'
export type { StaffInsert, StaffModel as StaffRow } from './modules/staff/staff.model'

export { patients } from './modules/patients/patients.model'
export type { PatientInsert, PatientModel as PatientRow } from './modules/patients/patients.model'

export { appointments } from './modules/appointments/appointments.model'
export type { AppointmentInsert, AppointmentModel as AppointmentRow } from './modules/appointments/appointments.model'
