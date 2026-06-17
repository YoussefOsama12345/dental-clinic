import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, CalendarClock, Stethoscope, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FormPageShell, FormSection } from '@/components/ui/form-page-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog'
import { Field } from '@/components/ui/field'
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { Pill } from '@/components/ui/pill'
import { appointmentSchema, type AppointmentFormData } from '../schemas/appointments.schema'
import { useAppointment, useCreateAppointment, useDeleteAppointment, useUpdateAppointment } from '../hooks/appointments.hook'
import { usePatients } from '@/features/patients/hooks/patients.hook'
import { useDentists } from '@/features/dentists/hooks/dentists.hook'
import type { Appointment, Dentist, Patient } from '@/types/api'

const STATUSES = ['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'] as const
const TYPES = ['consultation', 'cleaning', 'follow_up', 'emergency', 'treatment'] as const
const OUTCOMES = ['completed_normally', 'needs_follow_up', 'referred', 'treatment_plan_created'] as const

function toDateInputValue(value: string) {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toTimeInputValue(value: string) {
  const date = new Date(value)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const inputCls =
  'w-full rounded-xl bg-[#f8fafc] ring-1 ring-[#e2e8f0] px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#04CF9E]/30'

function toForm(appointment: Appointment): AppointmentFormData {
  return {
    patientId: appointment.patientId,
    dentistId: appointment.dentistId,
    date: toDateInputValue(appointment.startsAt),
    startTime: toTimeInputValue(appointment.startsAt),
    endTime: toTimeInputValue(appointment.endsAt),
    status: appointment.status,
    type: appointment.type ?? '',
    room: appointment.room ?? '',
    reason: appointment.reason ?? '',
    notes: appointment.notes ?? '',
    cancellationReason: appointment.cancellationReason ?? '',
    outcome: appointment.outcome ?? '',
    fee: appointment.fee ?? '',
  }
}

export function AppointmentFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isEdit = !!id
  const { data: appointment, isLoading } = useAppointment(id)
  const { data: patientsPage } = usePatients({ pageSize: 1000, status: 'all' })
  const { data: dentists = [] } = useDentists({})
  const create = useCreateAppointment()
  const update = useUpdateAppointment()
  const del = useDeleteAppointment()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isLeavingAfterSave, setIsLeavingAfterSave] = useState(false)

  const patients = patientsPage?.data ?? []

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: '',
      dentistId: '',
      date: '',
      startTime: '',
      endTime: '',
      status: 'scheduled',
      type: 'consultation',
      room: '',
      reason: '',
      notes: '',
      cancellationReason: '',
      outcome: '',
      fee: '',
    },
  })

  useEffect(() => {
    if (isEdit) {
      if (appointment) reset(toForm(appointment))
    }
  }, [appointment, isEdit, reset])

  const unsavedChanges = useUnsavedChangesGuard(isDirty && !create.isPending && !update.isPending && !del.isPending && !isLeavingAfterSave)

  const onSubmit = handleSubmit(async (data) => {
    const startsAt = new Date(`${data.date}T${data.startTime}`)
    const endsAt = new Date(`${data.date}T${data.endTime}`)

    if (endsAt <= startsAt) {
      setErrorMsg(t('appointments.endAfterStart'))
      return
    }

    const payload: Partial<Appointment> = {
      patientId: data.patientId,
      dentistId: data.dentistId,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      status: data.status,
      type: data.type || null,
      room: data.room || null,
      reason: data.reason || null,
      notes: data.notes || null,
      cancellationReason: data.cancellationReason || null,
      outcome: data.outcome || null,
      fee: data.fee || null,
    }

    setErrorMsg(null)

    try {
      const saved = isEdit && id
        ? await update.mutateAsync({ id, data: payload })
        : await create.mutateAsync(payload)

      reset(data)
      setIsLeavingAfterSave(true)
      navigate(`/appointments/${saved.id}`, { replace: true })
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status === 409) setErrorMsg(t('appointments.conflict'))
      else setErrorMsg(t('appointments.saveError'))
    }
  })

  const selectedPatient = patients.find((patientItem) => patientItem.id === watch('patientId'))
  const selectedDentist = dentists.find((dentistItem) => dentistItem.id === watch('dentistId'))

  const removeAppointment = async () => {
    if (!id) return
    await del.mutateAsync(id)
    setIsLeavingAfterSave(true)
    navigate('/appointments', { replace: true })
  }

  if (isEdit && isLoading) {
    return <div className="space-y-4"><div className="h-10 w-40 animate-pulse rounded-xl bg-muted" /><div className="h-72 animate-pulse rounded-3xl bg-muted" /></div>
  }

  return (
    <>
      <FormPageShell
        backHref="/appointments"
        backLabel={t('pages.appointments.title')}
        title={isEdit ? t('appointments.editTitle') : t('appointments.newTitle')}
        subtitle={t('pages.appointments.subtitle')}
        cancelHref="/appointments"
        onSubmit={onSubmit}
        submitting={create.isPending || update.isPending}
        sidebar={
          <Card>
            <CardHeader>
              <CardTitle>{selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : t('appointments.patient')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 text-sm text-muted-foreground">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="teal">{t(`status.appointment.${watch('status')}`)}</Pill>
                {selectedDentist ? <Pill tone="muted">{selectedDentist.fullName}</Pill> : null}
              </div>
              <div className="space-y-2">
                <p>{watch('date') || t('common.date')}</p>
                <p>{watch('startTime') && watch('endTime') ? `${watch('startTime')} - ${watch('endTime')}` : t('appointments.time')}</p>
                <p>{watch('reason') || t('appointments.reason')}</p>
                {watch('notes') ? <p className="line-clamp-3">{watch('notes')}</p> : null}
              </div>
            </CardContent>
          </Card>
        }
      >
        <FormSection title={t('appointments.patient')} icon={UserRound}>
          <Field label={t('appointments.patient')} required error={errors.patientId && t('common.required')}>
            <Combobox
              options={patients
                .filter((patientItem) => patientItem.status !== 'archived' || patientItem.id === watch('patientId'))
                .map((patientItem: Patient) => ({
                  value: patientItem.id,
                  label: `${patientItem.firstName} ${patientItem.lastName}`,
                  sublabel: patientItem.phone ?? undefined,
                }))}
              value={watch('patientId')}
              onChange={(value) => setValue('patientId', value, { shouldDirty: true, shouldValidate: true })}
              placeholder={t('appointments.selectPatient')}
              searchPlaceholder={t('patients.search')}
              emptyText={t('appointments.noPatientMatch')}
            />
          </Field>
        </FormSection>

        <FormSection title={t('appointments.dentist')} icon={Stethoscope}>
          <Field label={t('appointments.dentist')} required error={errors.dentistId && t('common.required')}>
            <Select value={watch('dentistId')} onValueChange={(value) => setValue('dentistId', value, { shouldDirty: true, shouldValidate: true })}>
              <SelectTrigger><SelectValue placeholder={t('appointments.selectDentist')} /></SelectTrigger>
              <SelectContent>
                {dentists
                  .filter((dentist: Dentist) => dentist.isActive || dentist.id === watch('dentistId'))
                  .map((dentist: Dentist) => <SelectItem key={dentist.id} value={dentist.id}>{dentist.fullName}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </FormSection>

        <FormSection title={t('common.date')} icon={CalendarClock}>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label={t('appointments.date')} required error={errors.date && t('common.required')}>
              <Input type="date" className={inputCls} {...register('date')} />
            </Field>
            <Field label={t('appointments.start')} required error={errors.startTime && t('common.required')}>
              <Input type="time" className={inputCls} {...register('startTime')} />
            </Field>
            <Field label={t('appointments.end')} required error={errors.endTime && t('common.required')}>
              <Input type="time" className={inputCls} {...register('endTime')} />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t('appointments.status')} required>
              <Select value={watch('status')} onValueChange={(value) => setValue('status', value as AppointmentFormData['status'], { shouldDirty: true, shouldValidate: true })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => <SelectItem key={status} value={status}>{t(`status.appointment.${status}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t('appointments.reason')}>
              <Input className={inputCls} {...register('reason')} />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t('appointments.type')}>
              <Select value={watch('type')} onValueChange={(value) => setValue('type', value as AppointmentFormData['type'], { shouldDirty: true, shouldValidate: true })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map((type) => <SelectItem key={type} value={type}>{t(`appointments.typeOption.${type}`)}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={t('appointments.room')} error={errors.room && String(errors.room.message)}>
              <Input className={inputCls} {...register('room')} />
            </Field>
            <Field label={t('appointments.outcome')}>
              <Select value={watch('outcome') || 'none'} onValueChange={(value) => setValue('outcome', value === 'none' ? '' : value as AppointmentFormData['outcome'], { shouldDirty: true, shouldValidate: true })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="none">{t('common.none')}</SelectItem>{OUTCOMES.map((outcome) => <SelectItem key={outcome} value={outcome}>{t(`appointments.outcomeOption.${outcome}`)}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={t('appointments.fee')} error={errors.fee && String(errors.fee.message)}>
              <Input className={inputCls} inputMode="decimal" {...register('fee')} />
            </Field>
          </div>

          {watch('status') === 'cancelled' ? (
            <Field label={t('appointments.cancellationReason')} error={errors.cancellationReason && String(errors.cancellationReason.message)}>
              <textarea rows={3} className={`${inputCls} min-h-24 resize-y`} {...register('cancellationReason')} />
            </Field>
          ) : null}

          <Field label={t('appointments.notes', 'Clinical notes')} error={errors.notes && String(errors.notes.message)}>
            <textarea
              rows={4}
              className={`${inputCls} min-h-28 resize-y`}
              placeholder={t('appointments.notesPlaceholder', 'Add diagnosis, procedure notes, or follow-up instructions...')}
              {...register('notes')}
            />
          </Field>

          {errorMsg ? (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2.5 text-sm font-medium text-red-600">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          ) : null}
        </FormSection>

        {isEdit ? (
          <FormSection title={t('appointments.delete')} icon={AlertTriangle}>
            <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex h-11 items-center justify-center rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50">
              {t('appointments.delete')}
            </button>
          </FormSection>
        ) : null}
      </FormPageShell>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t('appointments.deleteTitle')}
        description={t('appointments.deleteDesc', {
          patient: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '',
          dentist: selectedDentist?.fullName ?? '',
        })}
        confirmLabel={t('appointments.delete')}
        loading={del.isPending}
        onConfirm={removeAppointment}
      />
      <UnsavedChangesDialog open={unsavedChanges.open} onStay={unsavedChanges.stay} onDiscard={unsavedChanges.discard} />
    </>
  )
}
