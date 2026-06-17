import { create } from 'zustand'
import type { OnboardingData } from '../types/onboarding.types'

const defaultWorkingHours: OnboardingData['workingHours'] = {
  monday:    { enabled: true,  open: '09:00', close: '17:00' },
  tuesday:   { enabled: true,  open: '09:00', close: '17:00' },
  wednesday: { enabled: true,  open: '09:00', close: '17:00' },
  thursday:  { enabled: true,  open: '09:00', close: '17:00' },
  friday:    { enabled: true,  open: '09:00', close: '17:00' },
  saturday:  { enabled: true,  open: '09:00', close: '14:00' },
  sunday:    { enabled: false, open: '09:00', close: '17:00' },
}

interface OnboardingState {
  data: OnboardingData
  currentStep: number
  totalSteps: number
  setField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void
  setStep: (step: number) => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  data: {
    fullName: '',
    clinicName: '',
    avatarUrl: null,
    clinicAddress: '',
    phone: '',
    language: 'en',
    selectedSpecialty: null,
    selectedVoice: null,
    workingHours: defaultWorkingHours,
    selectedPlan: null,
  },
  currentStep: 1,
  totalSteps: 5,
  setField: (key, value) =>
    set((state) => ({ data: { ...state.data, [key]: value } })),
  setStep: (step) => set({ currentStep: step }),
}))
