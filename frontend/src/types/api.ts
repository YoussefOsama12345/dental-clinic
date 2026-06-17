// ─────────────────────────────────────────────────────────────────────────────
// Canonical API/domain types — the single source of truth for the data contract.
// Both the mock layer (src/mocks) and feature services import from here, so when
// the real backend is wired these shapes stay identical.
// ─────────────────────────────────────────────────────────────────────────────

export type ID = string

// ─── Patient ──────────────────────────────────────────────────────────────────
export type Gender = 'male' | 'female' | 'other' | 'unspecified'
export type PatientStatus = 'active' | 'inactive' | 'archived'
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'

export interface Patient {
  id: ID
  firstName: string
  lastName: string
  gender: Gender
  dateOfBirth: string | null
  phone: string | null
  email: string | null
  address: string | null
  // Medical profile
  bloodType: BloodType | null
  allergies: string[]
  chronicConditions: string[]
  medications: string[]
  smoker: boolean
  medicalNotes: string | null
  // Emergency contact
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  primaryDentistId: ID | null
  status: PatientStatus
  createdAt: string
  updatedAt: string
}

// ─── Dentist (clinical provider) ──────────────────────────────────────────────
export interface Dentist {
  id: ID
  fullName: string
  specialty: string | null
  licenseNumber: string | null
  phone: string | null
  email: string | null
  color: string | null
  // Professional profile
  yearsExperience: number | null
  qualifications: string[]
  bio: string | null
  workingDays: string[]
  workStart: string | null
  workEnd: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ─── Staff (non-provider personnel) ───────────────────────────────────────────
export type StaffRole = 'reception' | 'nurse' | 'assistant' | 'manager' | 'accountant' | 'other'
export type EmploymentStatus = 'active' | 'on_leave' | 'inactive'

export interface Staff {
  id: ID
  fullName: string
  role: StaffRole
  phone: string | null
  email: string | null
  status: EmploymentStatus
  workingDays: string[]
  workStart: string | null
  workEnd: string | null
  createdAt: string
  updatedAt: string
}

// ─── Combined roster (read-only union: dentists tagged Doctor + staff) ─────────
export type RosterRole = 'Doctor' | 'Reception' | 'Nurse' | StaffRole
export interface RosterMember {
  id: ID
  kind: 'dentist' | 'staff'
  fullName: string
  role: RosterRole
  phone: string | null
  email: string | null
  status: string
  workingDays?: string[]
  workStart?: string | null
  workEnd?: string | null
}

// ─── Appointment ──────────────────────────────────────────────────────────────
export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export interface Appointment {
  id: ID
  patientId: ID
  dentistId: ID
  startsAt: string
  endsAt: string
  status: AppointmentStatus
  type: 'consultation' | 'cleaning' | 'follow_up' | 'emergency' | 'treatment' | null
  room: string | null
  reason: string | null
  notes: string | null
  cancellationReason: string | null
  outcome: 'completed_normally' | 'needs_follow_up' | 'referred' | 'treatment_plan_created' | null
  fee: string | null
  createdAt: string
  updatedAt: string
}

// ─── Shared response shapes ───────────────────────────────────────────────────
export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface AuthUser {
  id: ID
  email: string
  name: string
  avatar?: string
  createdAt: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
}
