import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { format, differenceInYears } from 'date-fns'
import {
  ArrowLeft, Pencil, Phone, Mail, MapPin, Cake, User, Stethoscope,
  Activity, CalendarClock, FileText, Droplet, Cigarette, AlertTriangle,
  HeartPulse, Pill as PillIcon, type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Pill } from '@/components/ui/pill'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/status-badge'
import { PersonCell, initialsOf } from '@/components/ui/person-cell'
import { InfoRow } from '@/components/ui/info-row'
import { ProfileStats } from '@/components/ui/profile-stats'
import { localeFor } from '@/lib/date'
import { usePatient } from '../hooks/patients.hook'
import { useDentists } from '@/features/dentists/hooks/dentists.hook'
import { useAppointments } from '@/features/appointments/hooks/appointments.hook'
import type { Dentist } from '@/types/api'

function ChipsRow({ icon: Icon, label, items }: { icon: LucideIcon; label: string; items: string[] }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/40 py-2.5 last:border-0">
      <span className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 text-[#04CF9E]" />
        {label}
      </span>
      {items.length === 0 ? (
        <span className="text-sm font-medium text-foreground">—</span>
      ) : (
        <span className="flex flex-wrap justify-end gap-1.5">
          {items.map((x) => (
            <span
              key={x}
              className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{ backgroundColor: 'rgba(4,207,158,0.12)', color: '#067356' }}
            >
              {x}
            </span>
          ))}
        </span>
      )}
    </div>
  )
}

function PatientAppointments({ patientId, dentists }: { patientId: string; dentists: Dentist[] }) {
  const { t, i18n } = useTranslation()
  const locale = localeFor(i18n.language)
  const { data: appts = [], isLoading } = useAppointments({ patientId })
  const dentistOf = (id: string) => dentists.find((d) => d.id === id)

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
  }
  if (appts.length === 0) {
    return <EmptyState icon={CalendarClock} title={t('patients.noAppointments')} className="py-12" />
  }
  return (
    <div className="space-y-2">
      {appts.map((a) => {
        const d = dentistOf(a.dentistId)
        return (
          <div key={a.id} className="flex items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-3">
            <div className="flex w-32 shrink-0 flex-col">
              <span className="text-sm font-semibold text-foreground">{format(new Date(a.startsAt), 'd MMM yyyy', { locale })}</span>
              <span className="text-xs text-muted-foreground">{format(new Date(a.startsAt), 'HH:mm')}–{format(new Date(a.endsAt), 'HH:mm')}</span>
            </div>
            <PersonCell name={d?.fullName ?? '—'} subtitle={a.reason || undefined} color={d?.color} className="flex-1" />
            <StatusBadge status={a.status} />
          </div>
        )
      })}
    </div>
  )
}

export function PatientProfilePage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const locale = localeFor(i18n.language)
  const { data: patient, isLoading } = usePatient(id)
  const { data: dentists = [] } = useDentists({})
  const { data: patientAppts = [] } = useAppointments({ patientId: id })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }
  if (!patient) {
    return (
      <EmptyState
        icon={User}
        title={t('patients.notFound')}
        description={t('patients.notFoundDesc')}
        className="py-24"
        action={<Link to="/patients" className="text-sm font-semibold text-[#04CF9E]">{t('patients.backToList')}</Link>}
      />
    )
  }

  // Internal stats: next appointment, last completed visit, total visits.
  const nowMs = Date.now()
  const upcoming = patientAppts
    .filter((a) => a.status !== 'cancelled' && a.status !== 'no_show' && new Date(a.startsAt).getTime() >= nowMs)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0]
  const completedVisits = patientAppts.filter((a) => a.status === 'completed')
  const lastVisit = [...completedVisits].sort(
    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
  )[0]

  const fullName = `${patient.firstName} ${patient.lastName}`
  const dentistName = patient.primaryDentistId ? dentists.find((d) => d.id === patient.primaryDentistId)?.fullName : null
  const age = patient.dateOfBirth ? differenceInYears(new Date(), new Date(patient.dateOfBirth)) : null
  const genderLabel = t(`gender.${patient.gender}`)
  const facts = [patient.phone, age != null ? t('patients.ageValue', { age }) : null, dentistName].filter(Boolean).join('  ·  ')

  return (
    <div className="space-y-6">
      <Link to="/patients" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t('patients.backToList')}
      </Link>

      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold"
              style={{ backgroundColor: 'rgba(4,207,158,0.12)', color: '#067356' }}
            >
              {initialsOf(fullName)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">{fullName}</h1>
                <Pill tone={patient.status === 'active' ? 'teal' : 'muted'}>{t(`status.patient.${patient.status}`)}</Pill>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{facts || genderLabel}</p>
              {(patient.allergies?.length ?? 0) > 0 && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#067356]">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {t('patients.allergies')}: {(patient.allergies ?? []).join(', ')}
                </p>
              )}
            </div>
          </div>
          <Button asChild className="h-11 shrink-0 rounded-[12px] bg-[#04CF9E] px-5 font-semibold text-white shadow-sm transition-all hover:bg-[#03b589] hover:shadow-md">
            <Link to={`/patients/${patient.id}/edit`}>
              <Pencil className="me-2 h-4 w-4" />
              {t('common.edit')}
            </Link>
          </Button>
        </div>
        <ProfileStats
          items={[
            {
              label: t('patients.stat.nextAppointment'),
              value: upcoming ? format(new Date(upcoming.startsAt), 'd MMM · HH:mm', { locale }) : '—',
            },
            {
              label: t('patients.stat.lastVisit'),
              value: lastVisit ? format(new Date(lastVisit.startsAt), 'd MMM yyyy', { locale }) : '—',
            },
            { label: t('patients.stat.totalVisits'), value: completedVisits.length },
          ]}
        />
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('patients.tab.overview')}</TabsTrigger>
          <TabsTrigger value="appointments">{t('patients.tab.appointments')}</TabsTrigger>
          <TabsTrigger value="notes">{t('patients.tab.notes')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-4 w-4 text-[#04CF9E]" />{t('patients.personalInfo')}</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <InfoRow icon={User} label={t('patients.gender')} value={genderLabel} />
              <InfoRow icon={Cake} label={t('patients.dateOfBirth')} value={patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'd MMM yyyy', { locale }) : null} />
              <InfoRow icon={Activity} label={t('patients.age')} value={age != null ? t('patients.ageValue', { age }) : null} />
              <InfoRow
                icon={Stethoscope}
                label={t('patients.primaryDentist')}
                value={dentistName}
                href={patient.primaryDentistId ? `/dentists/${patient.primaryDentistId}` : undefined}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#04CF9E]" />{t('patients.contactInfo')}</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <InfoRow icon={Phone} label={t('patients.phone')} value={patient.phone} />
              <InfoRow icon={Mail} label={t('patients.email')} value={patient.email} />
              <InfoRow icon={MapPin} label={t('patients.address')} value={patient.address} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-[#04CF9E]" />{t('patients.medicalProfile')}</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <InfoRow icon={Droplet} label={t('patients.bloodType')} value={patient.bloodType} />
              <InfoRow icon={Cigarette} label={t('patients.smoker')} value={patient.smoker ? t('common.yes') : t('common.no')} />
              <ChipsRow icon={AlertTriangle} label={t('patients.allergies')} items={patient.allergies ?? []} />
              <ChipsRow icon={Activity} label={t('patients.chronicConditions')} items={patient.chronicConditions ?? []} />
              <ChipsRow icon={PillIcon} label={t('patients.medications')} items={patient.medications ?? []} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#04CF9E]" />{t('patients.emergencyContactSection')}</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <InfoRow icon={User} label={t('patients.emergencyName')} value={patient.emergencyContactName} />
              <InfoRow icon={Phone} label={t('patients.emergencyPhone')} value={patient.emergencyContactPhone} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <PatientAppointments patientId={patient.id} dentists={dentists} />
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent>
              {patient.medicalNotes ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{patient.medicalNotes}</p>
              ) : (
                <EmptyState icon={FileText} title={t('patients.noNotes')} className="py-10" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
