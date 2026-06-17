import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { format, formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { ArrowLeft, CalendarClock, Clock, CreditCard, FileText, Pencil, Stethoscope, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { InfoRow } from '@/components/ui/info-row'
import { Pill } from '@/components/ui/pill'
import { initialsOf } from '@/components/ui/person-cell'
import { ProfileStats } from '@/components/ui/profile-stats'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/ui/status-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppointment } from '../hooks/appointments.hook'
import { usePatient } from '@/features/patients/hooks/patients.hook'
import { useDentist } from '@/features/dentists/hooks/dentists.hook'

function money(value: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value)
}

export function AppointmentProfilePage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ar' ? ar : undefined
  const { data: appointment, isLoading } = useAppointment(id)
  const { data: patient } = usePatient(appointment?.patientId)
  const { data: dentist } = useDentist(appointment?.dentistId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!appointment) {
    return (
      <EmptyState
        icon={CalendarClock}
        title={t('appointments.notFound', 'Appointment not found')}
        description={t('appointments.notFoundDesc', 'This appointment does not exist or you do not have access to it.')}
        className="py-24"
        action={<Link to="/appointments" className="text-sm font-semibold text-[#04CF9E]">{t('appointments.backToList', 'Back to appointments')}</Link>}
      />
    )
  }

  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : t('appointments.patient', 'Patient')
  const dentistName = dentist?.fullName ?? t('appointments.dentist', 'Dentist')
  const starts = new Date(appointment.startsAt)
  const ends = new Date(appointment.endsAt)
  const durationMinutes = Math.max(0, Math.round((ends.getTime() - starts.getTime()) / 60000))
  const estimatedCost = appointment.fee ? Number(appointment.fee) : appointment.status === 'completed' ? 120 : 0

  return (
    <div className="space-y-6">
      <Link to="/appointments" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t('appointments.backToList', 'Back to appointments')}
      </Link>

      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold" style={{ backgroundColor: 'rgba(4,207,158,0.12)', color: '#067356' }}>
              {initialsOf(patientName)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">{patientName}</h1>
                <StatusBadge status={appointment.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{dentistName}  ·  {format(starts, 'EEE, dd MMM yyyy', { locale })}  ·  {format(starts, 'HH:mm', { locale })}–{format(ends, 'HH:mm', { locale })}</p>
              {appointment.reason ? <p className="mt-1.5 text-xs font-semibold text-[#067356]">{appointment.reason}</p> : null}
            </div>
          </div>
          <Button asChild className="h-11 shrink-0 rounded-[12px] bg-[#04CF9E] px-5 font-semibold text-white shadow-sm transition-all hover:bg-[#03b589] hover:shadow-md">
            <Link to={`/appointments/${appointment.id}/edit`}>
              <Pencil className="me-2 h-4 w-4" />
              {t('common.edit')}
            </Link>
          </Button>
        </div>
        <ProfileStats
          items={[
            { label: t('common.date'), value: format(starts, 'd MMM yyyy', { locale }) },
            { label: t('appointments.time'), value: `${format(starts, 'HH:mm', { locale })}–${format(ends, 'HH:mm', { locale })}` },
            { label: t('appointments.duration', 'Duration'), value: `${durationMinutes} ${t('common.minutes', 'min')}` },
          ]}
        />
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('common.overview', 'Overview')}</TabsTrigger>
          <TabsTrigger value="clinical">{t('appointments.tab.clinical', 'Clinical notes')}</TabsTrigger>
          <TabsTrigger value="billing">{t('appointments.tab.billing', 'Billing')}</TabsTrigger>
          <TabsTrigger value="activity">{t('appointments.tab.activity', 'Activity')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>{t('appointments.summary', 'Appointment summary')}</CardTitle></CardHeader>
            <CardContent className="grid gap-3 pt-0 md:grid-cols-2">
              <InfoRow icon={UserRound} label={t('appointments.patient')} value={patientName} href={patient ? `/patients/${patient.id}` : undefined} />
              <InfoRow icon={Stethoscope} label={t('appointments.dentist')} value={dentistName} href={dentist ? `/dentists/${dentist.id}` : undefined} />
              <InfoRow icon={CalendarClock} label={t('appointments.date')} value={format(starts, 'PPPP', { locale })} />
              <InfoRow icon={Clock} label={t('appointments.time')} value={`${format(starts, 'HH:mm', { locale })} – ${format(ends, 'HH:mm', { locale })}`} />
              <InfoRow icon={FileText} label={t('appointments.type')} value={appointment.type ? t(`appointments.typeOption.${appointment.type}`) : null} />
              <InfoRow icon={CalendarClock} label={t('appointments.room')} value={appointment.room} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t('appointments.reason', 'Reason')}</CardTitle></CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              {appointment.reason || t('common.noData', 'No data provided.')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinical" className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#04CF9E]" />{t('appointments.notes', 'Clinical notes')}</CardTitle></CardHeader>
            <CardContent className="pt-0 text-sm leading-6 text-muted-foreground">
              {appointment.notes || t('appointments.noNotes', 'No clinical notes have been added yet.')}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t('appointments.followUp', 'Follow-up')}</CardTitle></CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              {appointment.outcome ? t(`appointments.outcomeOption.${appointment.outcome}`) : appointment.status === 'completed' ? t('appointments.followUpRecommended', 'Review patient progress and schedule a follow-up if needed.') : t('appointments.followUpPending', 'Follow-up details can be completed after the visit.')}
            </CardContent>
          </Card>
          {appointment.cancellationReason ? (
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>{t('appointments.cancellationReason')}</CardTitle></CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">{appointment.cancellationReason}</CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="billing" className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader><CardTitle>{t('billing.estimated', 'Estimated amount')}</CardTitle></CardHeader><CardContent className="pt-0 text-2xl font-bold">{money(estimatedCost)}</CardContent></Card>
          <Card><CardHeader><CardTitle>{t('billing.paymentStatus', 'Payment status')}</CardTitle></CardHeader><CardContent className="pt-0"><Pill tone={estimatedCost ? 'muted' : 'teal'}>{estimatedCost ? t('billing.unpaid', 'Unpaid') : t('billing.notRequired', 'Not required')}</Pill></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-[#04CF9E]" />{t('billing.invoice', 'Invoice')}</CardTitle></CardHeader><CardContent className="pt-0 text-sm text-muted-foreground">{t('billing.invoicePlaceholder', 'Invoice generation can be connected to the billing module.')}</CardContent></Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader><CardTitle>{t('common.activity', 'Activity')}</CardTitle></CardHeader>
            <CardContent className="space-y-3 pt-0 text-sm text-muted-foreground">
              <p>{t('common.created', 'Created')}: {formatDistanceToNow(new Date(appointment.createdAt), { addSuffix: true, locale })}</p>
              <p>{t('common.updated', 'Updated')}: {formatDistanceToNow(new Date(appointment.updatedAt), { addSuffix: true, locale })}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
