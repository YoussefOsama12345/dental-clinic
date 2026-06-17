// ─────────────────────────────────────────────────────────────────────────────
// Single-hue palette. The whole app commits to ONE brand color (teal #04CF9E)
// expressed in shades — no secondary hues. Neutral gray is used only to
// de-emphasize (e.g. cancelled). Import these tokens instead of hardcoding hex.
// ─────────────────────────────────────────────────────────────────────────────
import type { AppointmentStatus } from '@/types/api'

export const TEAL = {
  50: '#ECFDF8',
  100: '#D1FAEF',
  200: '#A7F3DF',
  300: '#6EE7C7',
  400: '#34D7AC',
  500: '#04CF9E', // brand
  600: '#03B589',
  700: '#0E9B79',
  800: '#067356',
  900: '#045140',
} as const

export const NEUTRAL = {
  soft: '#94a3b8',
  strong: '#64748b',
} as const

/** Dentists are distinguished by teal SHADE (one hue, many degrees), not by hue. */
export const DENTIST_PALETTE = [
  TEAL[500], TEAL[700], TEAL[400], TEAL[600], TEAL[800], TEAL[300], TEAL[900],
]

/** Appointment status → teal shade (active) / neutral gray (cancelled/no-show). */
export const APPT_STATUS_COLOR: Record<AppointmentStatus, string> = {
  completed: TEAL[700],
  confirmed: TEAL[600],
  checked_in: TEAL[500],
  in_progress: TEAL[400],
  scheduled: TEAL[300],
  cancelled: NEUTRAL.soft,
  no_show: NEUTRAL.strong,
}

export const isMutedStatus = (s: AppointmentStatus): boolean => s === 'cancelled' || s === 'no_show'
