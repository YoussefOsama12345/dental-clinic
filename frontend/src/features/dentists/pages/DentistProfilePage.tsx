import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import {
  ArrowLeft, Pencil, Phone, Mail, Stethoscope, BadgeCheck, Activity,
  CalendarClock, Users, Award, GraduationCap, Clock,
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
import { useDentist } from '../hooks/dentists.hook'
import { useAppointments } from '@/features/appointments/hooks/appointments.hook'
import { usePatients } from '@/features/patients/hooks/patients.hook'

function DentistAppointments({ dentistId }: { dentistId: string }) {
  const { t, i18n } = useTranslation()
  const locale = localeFor(i18n.language)
  const { data: allAppts = [], isLoading } = useAppointments({ dentistId })
  // Full roster incl. archived so old appointment names resolve (mock-side; the
  // real backend joins server-side).
  const { data: patientsPage } = usePatients({ pageSize: 1000, status: 'all' })
  const patientName = (id: string) => {
    const p = patientsPage?.data.find((x) => x.id === id)
    return p ? `${p.firstName} ${p.lastName}` : '—'
  }

  // API returns desc by startsAt — split around "now" so today/history are visible.
  const nowMs = Date.now()
  const upcoming = allAppts
    .filter((a) => new Date(a.startsAt).getTime() >= nowMs)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 10)
  const recent = allAppts.filter((a) => new Date(a.startsAt).getTime() < nowMs).slice(0, 15)

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
  if (allAppts.length === 0) return <EmptyState icon={CalendarClock} title={t('dentists.noAppointments')} className="py-12" />

  const row = (a: (typeof allAppts)[number]) => (
    <div key={a.id} className="flex items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-3">
      <div className="flex w-32 shrink-0 flex-col">
        <span className="text-sm font-semibold text-foreground">{format(new Date(a.startsAt), 'd MMM yyyy', { locale })}</span>
        <span className="text-xs text-muted-foreground">{format(new Date(a.startsAt), 'HH:mm')}–{format(new Date(a.endsAt), 'HH:mm')}</span>
      </div>
      <Link to={`/patients/${a.patientId}`} className="min-w-0 flex-1 transition-opacity hover:opacity-80">
        <PersonCell name={patientName(a.patientId)} subtitle={a.reason || undefined} />
      </Link>
      <StatusBadge status={a.status} />
    </div>
  )

  const sectionTitle = 'px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'
  return (
    <div className="space-y-4">
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <p className={sectionTitle}>{t('dentists.upcoming')}</p>
          {upcoming.map(row)}
        </div>
      )}
      {recent.length > 0 && (
        <div className="space-y-2">
          <p className={sectionTitle}>{t('dentists.recent')}</p>
          {recent.map(row)}
        </div>
      )}
    </div>
  )
}

function DentistPatients({ dentistId }: { dentistId: string }) {
  const { t } = useTranslation()
  const { data, isLoading } = usePatients({ dentistId, pageSize: 200 })
  const patients = data?.data ?? []
  if (isLoading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
  if (patients.length === 0) return <EmptyState icon={Users} title={t('dentists.noPatients')} className="py-12" />
  return (
    <div className="space-y-2">
      {patients.map((p) => (
        <Link key={p.id} to={`/patients/${p.id}`} className="flex items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:bg-muted/30">
          <PersonCell name={`${p.firstName} ${p.lastName}`} subtitle={p.phone || undefined} className="flex-1" />
          <Pill tone={p.status === 'active' ? 'teal' : 'muted'}>{t(`status.patient.${p.status}`)}</Pill>
        </Link>
      ))}
    </div>
  )
}

export function DentistProfilePage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { data: dentist, isLoading } = useDentist(id)
  const { data: dentistAppts = [] } = useAppointments({ dentistId: id })
  const { data: dentistPatientsPage } = usePatients({ dentistId: id })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }
  if (!dentist) {
    return (
      <EmptyState
        icon={Stethoscope}
        title={t('dentists.notFound')}
        description={t('dentists.notFoundDesc')}
        className="py-24"
        action={<Link to="/dentists" className="text-sm font-semibold text-[#04CF9E]">{t('dentists.backToList')}</Link>}
      />
    )
  }

  const facts = [dentist.specialty, dentist.licenseNumber, dentist.phone].filter(Boolean).join('  ·  ')

  // Internal stats: today's load + assigned patients.
  const isTodayIso = (iso: string) => {
    const d = new Date(iso)
    const n = new Date()
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
  }
  const todayCount = dentistAppts.filter(
    (a) => a.status !== 'cancelled' && a.status !== 'no_show' && isTodayIso(a.startsAt),
  ).length
  const patientsCount = dentistPatientsPage?.total ?? 0

  return (
    <div className="space-y-6">
      <Link to="/dentists" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t('dentists.backToList')}
      </Link>

      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold"
              style={{ backgroundColor: `${dentist.color ?? '#04CF9E'}1F`, color: dentist.color ?? '#067356' }}
            >
              {initialsOf(dentist.fullName)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">{dentist.fullName}</h1>
                <Pill tone={dentist.isActive ? 'teal' : 'muted'}>{dentist.isActive ? t('common.active') : t('common.inactive')}</Pill>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{facts || t('dentists.specialty')}</p>
            </div>
          </div>
          <Button asChild className="h-11 shrink-0 rounded-[12px] bg-[#04CF9E] px-5 font-semibold text-white shadow-sm transition-all hover:bg-[#03b589] hover:shadow-md">
            <Link to={`/dentists/${dentist.id}/edit`}>
              <Pencil className="me-2 h-4 w-4" />
              {t('common.edit')}
            </Link>
          </Button>
        </div>
        <ProfileStats
          items={[
            { label: t('dentists.stat.today'), value: todayCount },
            { label: t('dentists.stat.patients'), value: patientsCount },
          ]}
        />
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('dentists.tab.overview')}</TabsTrigger>
          <TabsTrigger value="schedule">{t('dentists.schedule')}</TabsTrigger>
          <TabsTrigger value="appointments">{t('dentists.tab.appointments')}</TabsTrigger>
          <TabsTrigger value="patients">{t('dentists.tab.patients')}</TabsTrigger>
          <TabsTrigger value="performance">{t('dentists.performance')}</TabsTrigger>
          <TabsTrigger value="credentials">{t('dentists.credentials')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-[#04CF9E]" />{t('dentists.professionalInfo')}</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <InfoRow icon={Stethoscope} label={t('dentists.specialty')} value={dentist.specialty} />
              <InfoRow icon={BadgeCheck} label={t('dentists.licenseNumber')} value={dentist.licenseNumber} />
              <InfoRow
                icon={Award}
                label={t('dentists.experience')}
                value={dentist.yearsExperience != null ? t('dentists.yearsValue', { years: dentist.yearsExperience }) : null}
              />
              <InfoRow icon={Activity} label={t('dentists.status')} value={dentist.isActive ? t('common.active') : t('common.inactive')} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#04CF9E]" />{t('dentists.contactInfo')}</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <InfoRow icon={Phone} label={t('dentists.phone')} value={dentist.phone} />
              <InfoRow icon={Mail} label={t('dentists.email')} value={dentist.email} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#04CF9E]" />{t('dentists.schedule')}</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1.5 border-b border-border/40 py-2.5">
                {(dentist.workingDays?.length ?? 0) > 0 ? (
                  (dentist.workingDays ?? []).map((d) => (
                    <span key={d} className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: 'rgba(4,207,158,0.12)', color: '#067356' }}>
                      {t(`onboarding.workingHours.days.${d}`)}
                    </span>
                  ))
                ) : <span className="text-sm text-muted-foreground">—</span>}
              </div>
              <InfoRow icon={Clock} label={t('dentists.hours')} value={dentist.workStart && dentist.workEnd ? `${dentist.workStart}–${dentist.workEnd}` : null} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t('dentists.availability')}</CardTitle></CardHeader>
            <CardContent className="pt-0"><Pill tone={dentist.isActive ? 'teal' : 'muted'}>{dentist.isActive ? t('common.active') : t('common.inactive')}</Pill></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments"><DentistAppointments dentistId={dentist.id} /></TabsContent>
        <TabsContent value="patients"><DentistPatients dentistId={dentist.id} /></TabsContent>

        <TabsContent value="performance" className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader><CardTitle>{t('dentists.stat.today')}</CardTitle></CardHeader><CardContent className="pt-0 text-3xl font-bold">{todayCount}</CardContent></Card>
          <Card><CardHeader><CardTitle>{t('dentists.stat.patients')}</CardTitle></CardHeader><CardContent className="pt-0 text-3xl font-bold">{patientsCount}</CardContent></Card>
          <Card><CardHeader><CardTitle>{t('dentists.completedVisits')}</CardTitle></CardHeader><CardContent className="pt-0 text-3xl font-bold">{dentistAppts.filter((a) => a.status === 'completed').length}</CardContent></Card>
        </TabsContent>

        <TabsContent value="credentials" className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-[#04CF9E]" />{t('dentists.qualificationsTitle')}</CardTitle></CardHeader>
            <CardContent className="space-y-3 pt-0">
              {dentist.bio && <p className="text-sm leading-relaxed text-foreground">{dentist.bio}</p>}
              {(dentist.qualifications?.length ?? 0) > 0 ? (
                <ul className="space-y-2">{(dentist.qualifications ?? []).map((q) => <li key={q} className="flex items-center gap-2 text-sm text-muted-foreground"><BadgeCheck className="h-4 w-4 shrink-0 text-[#04CF9E]" />{q}</li>)}</ul>
              ) : !dentist.bio && <p className="text-sm text-muted-foreground">—</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t('dentists.licenseNumber')}</CardTitle></CardHeader>
            <CardContent className="pt-0"><InfoRow icon={BadgeCheck} label={t('dentists.licenseNumber')} value={dentist.licenseNumber} /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
