import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Edit2, Eye, Trash2, CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/status-badge'
import type { Appointment, Dentist, Patient } from '@/types/api'

interface AppointmentsTableProps {
  appointments: Appointment[]
  patients: Patient[]
  dentists: Dentist[]
  onView: (appointment: Appointment) => void
  onEdit: (appointment: Appointment) => void
  onDelete: (appointment: Appointment) => void
  selectedIds?: string[]
  onToggleSelected?: (id: string) => void
  onToggleAll?: () => void
  allVisibleSelected?: boolean
}

const TH = 'px-5 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'
const TH_ACTIONS = 'w-[148px] px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'

export function AppointmentsTable({
  appointments, patients, dentists, onView, onEdit, onDelete, selectedIds = [], onToggleSelected, onToggleAll, allVisibleSelected = false,
}: AppointmentsTableProps) {
  const { t, i18n } = useTranslation()

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId)
    return patient ? `${patient.firstName} ${patient.lastName}` : '—'
  }

  const getDentistName = (dentistId: string) => dentists.find(d => d.id === dentistId)?.fullName ?? '—'

  const sortedAppointments = useMemo(() => [...appointments].sort((a, b) => {
    const aDate = new Date(a.startsAt).getTime()
    const bDate = new Date(b.startsAt).getTime()
    return aDate - bDate
  }), [appointments])

  const formatTime = (dateStr: string) => format(new Date(dateStr), 'HH:mm', { locale: i18n.language === 'ar' ? ar : undefined })
  const formatDate = (dateStr: string) => format(new Date(dateStr), 'dd MMM yyyy', { locale: i18n.language === 'ar' ? ar : undefined })

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border/60 bg-muted/30">
          <th className="w-12 px-5 py-3"><input type="checkbox" checked={appointments.length > 0 && allVisibleSelected} onChange={onToggleAll} className="h-4 w-4 rounded border-border accent-[#04CF9E]" aria-label={t('bulk.selectAll', 'Select all')} /></th>
          <th className={TH}>{t('common.date')}</th>
          <th className={TH}>{t('appointments.time')}</th>
          <th className={TH}>{t('appointments.patient')}</th>
          <th className={`${TH} hidden lg:table-cell`}>{t('appointments.dentist')}</th>
          <th className={`${TH} hidden xl:table-cell`}>{t('appointments.reason')}</th>
          <th className={TH}>{t('appointments.status')}</th>
          <th className={TH_ACTIONS}>{t('common.actions')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/40">
        {sortedAppointments.length === 0 ? (
          <tr>
            <td colSpan={8} className="px-5 py-10">
              <EmptyState icon={CalendarClock} title={t('appointments.noEvents')} />
            </td>
          </tr>
        ) : (
          sortedAppointments.map((appt) => (
            <tr
              key={appt.id}
              role="button"
              tabIndex={0}
              onClick={() => onView(appt)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onView(appt)
                }
              }}
              className="group cursor-pointer transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04CF9E]/40"
            >
              <td className="px-5 py-4">
                <input type="checkbox" checked={selectedIds.includes(appt.id)} onChange={(event) => { event.stopPropagation(); onToggleSelected?.(appt.id) }} onClick={(event) => event.stopPropagation()} className="h-4 w-4 rounded border-border accent-[#04CF9E]" aria-label={t('bulk.selectRow', 'Select row')} />
              </td>
              <td className="px-5 py-4 text-foreground">{formatDate(appt.startsAt)}</td>
              <td className="px-5 py-4 text-foreground">
                <div className="flex items-center gap-1">
                  <span>{formatTime(appt.startsAt)}</span>
                  <span className="text-muted-foreground">–</span>
                  <span>{formatTime(appt.endsAt)}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-foreground">{getPatientName(appt.patientId)}</td>
              <td className="hidden px-5 py-4 text-muted-foreground lg:table-cell">{getDentistName(appt.dentistId)}</td>
              <td className="hidden max-w-xs truncate px-5 py-4 text-muted-foreground xl:table-cell">{appt.reason || '—'}</td>
              <td className="px-5 py-4"><StatusBadge status={appt.status} /></td>
              <td className="px-5 py-4 text-center align-middle">
                <div className="flex w-full items-center justify-center gap-1">
                  <Button type="button" variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); onView(appt) }} className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground" title={t('common.view')} aria-label={t('common.view')}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); onEdit(appt) }} className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground" title={t('common.edit')} aria-label={t('common.edit')}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); onDelete(appt) }} className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600" title={t('common.delete')} aria-label={t('common.delete')}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}
