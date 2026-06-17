import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { NEUTRAL, TEAL, isMutedStatus } from '@/lib/theme'
import type { AppointmentStatus } from '@/types/api'

/**
 * Coloured status pill — single-hue. Active statuses share a teal-tinted pill;
 * cancelled/no-show use neutral gray. The label carries the precise meaning.
 * Reused across Overview, Appointments, lists.
 */
export function StatusBadge({ status, className }: { status: AppointmentStatus | string; className?: string }) {
  const { t } = useTranslation()
  const s = status as AppointmentStatus
  const muted = isMutedStatus(s)
  const pillStyle = muted
    ? { backgroundColor: 'rgba(100,116,139,0.12)', color: NEUTRAL.strong }
    : { backgroundColor: 'rgba(4,207,158,0.12)', color: TEAL[800] }

  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold', className)}
      style={pillStyle}
    >
      {t(`status.appointment.${status}`, status)}
    </span>
  )
}
