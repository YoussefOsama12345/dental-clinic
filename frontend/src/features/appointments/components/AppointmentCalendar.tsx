import { useMemo, useState } from 'react'
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS, ar } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import type { Appointment, Dentist, Patient } from '@/types/api'

const locales = { 'en-US': enUS, ar }
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales })

const CANCELLED = ['cancelled', 'no_show']
const GREY = '#cbd5e1'

interface CalEvent {
  id: string
  title: string
  start: Date
  end: Date
  color: string
  cancelled: boolean
  resourceId: string
  resource: Appointment
}

interface CalResource {
  resourceId: string
  resourceTitle: string
}

export function AppointmentCalendar({
  appointments, patients, dentists, resourceDentists, onSelectSlot, onSelectEvent,
}: {
  appointments: Appointment[]
  patients: Patient[]
  dentists: Dentist[]
  resourceDentists: Dentist[]
  onSelectSlot: (start: Date, end: Date, dentistId?: string) => void
  onSelectEvent: (appt: Appointment) => void
}) {
  const { t, i18n } = useTranslation()
  // Day view is the operational default: per-dentist columns, real clinic flow.
  const [view, setView] = useState<View>(Views.DAY)
  const [date, setDate] = useState<Date>(() => new Date())

  const patientName = (id: string) => {
    const p = patients.find((x) => x.id === id)
    return p ? `${p.firstName} ${p.lastName}` : '—'
  }

  const events: CalEvent[] = useMemo(
    () =>
      appointments.map((a) => {
        const d = dentists.find((x) => x.id === a.dentistId)
        const cancelled = CANCELLED.includes(a.status)
        return {
          id: a.id,
          title: `${patientName(a.patientId)} · ${d?.fullName ?? ''}`,
          start: new Date(a.startsAt),
          end: new Date(a.endsAt),
          color: cancelled ? GREY : d?.color ?? '#04CF9E',
          cancelled,
          resourceId: a.dentistId,
          resource: a,
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appointments, patients, dentists],
  )

  const resources: CalResource[] = useMemo(
    () => resourceDentists.map((d) => ({ resourceId: d.id, resourceTitle: d.fullName })),
    [resourceDentists],
  )

  const culture = i18n.language?.startsWith('ar') ? 'ar' : 'en-US'

  const messages = {
    today: t('appointments.today'),
    previous: t('appointments.back'),
    next: t('appointments.next'),
    month: t('appointments.month'),
    week: t('appointments.week'),
    day: t('appointments.day'),
    agenda: t('appointments.agenda'),
    noEventsInRange: t('appointments.noEvents'),
    showMore: (n: number) => `+${n}`,
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      {/* Dentist colour legend */}
      {resourceDentists.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1">
          {resourceDentists.map((d) => (
            <span key={d.id} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color ?? '#04CF9E' }} />
              {d.fullName}
            </span>
          ))}
        </div>
      )}

      <div className="h-[640px]">
        <Calendar<CalEvent, CalResource>
          localizer={localizer}
          culture={culture}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={['month', 'week', 'day', 'agenda']}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          selectable
          resources={view === Views.DAY ? resources : undefined}
          resourceIdAccessor="resourceId"
          resourceTitleAccessor="resourceTitle"
          onSelectSlot={(slot) => onSelectSlot(slot.start as Date, slot.end as Date, (slot as { resourceId?: string }).resourceId)}
          onSelectEvent={(e) => onSelectEvent(e.resource)}
          eventPropGetter={(e) => ({
            style: {
              backgroundColor: e.color,
              borderColor: e.color,
              color: e.cancelled ? '#475569' : '#fff',
              borderRadius: 6,
              opacity: e.cancelled ? 0.7 : 1,
              textDecoration: e.cancelled ? 'line-through' : 'none',
            },
          })}
          step={30}
          timeslots={2}
          min={new Date(1970, 0, 1, 7, 0)}
          max={new Date(1970, 0, 1, 21, 0)}
          popup
          messages={messages}
          style={{ height: '100%' }}
        />
      </div>
    </div>
  )
}
