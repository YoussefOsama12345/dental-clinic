export type OnboardingStep =
  | 'identity'
  | 'setup'
  | 'specialty'
  | 'workingHours'
  | 'plans'

export interface WorkingHoursDay {
  enabled: boolean
  open: string
  close: string
}

export interface OnboardingData {
  fullName: string
  clinicName: string
  avatarUrl: string | null
  clinicAddress: string
  phone: string
  language: 'en' | 'ar'
  selectedSpecialty: string | null
  selectedVoice: string | null
  workingHours: Record<string, WorkingHoursDay>
  selectedPlan: 'starter' | 'pro' | 'enterprise' | null
}

export interface OnboardingNavItem {
  key: OnboardingStep
  label: string
  path: string
}
