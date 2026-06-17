import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { appointmentSchema, type AppointmentFormData } from '../schemas/appointments.schema'
import { useCreateAppointment, useUpdateAppointment } from '../hooks/appointments.hook'
import type { Appointment, Dentist, Patient } from '@/types/api'

const STATUSES = ['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'no_show'] as const

const inputCls =
  'w-full rounded-xl bg-[#f8fafc] ring-1 ring-[#e2e8f0] px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#04CF9E]/30'

type Slot = { start: Date; end: Date; dentistId?: string }

function toForm(appt: Appointment | null, slot: Slot | null): AppointmentFormData {
  if (appt) {
    const s = new Date(appt.startsAt)
    const e = new Date(appt.endsAt)
    return {
      patientId: appt.patientId, dentistId: appt.dentistId,
      date: format(s, 'yyyy-MM-dd'), startTime: format(s, 'HH:mm'), endTime: format(e, 'HH:mm'),
      status: appt.status === 'cancelled' ? 'scheduled' : appt.status, reason: appt.reason ?? '',
    }
  }
  const s = slot?.start ?? new Date()
  const e = slot?.end ?? new Date(s.getTime() + 30 * 60000)
  return {
    patientId: '', dentistId: slot?.dentistId ?? '',
    date: format(s, 'yyyy-MM-dd'), startTime: format(s, 'HH:mm'), endTime: format(e, 'HH:mm'),
    status: 'scheduled', reason: '',
  }
}

export function AppointmentDialog({
  open, onOpenChange, appointment, patients, dentists, onRequestDelete,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  appointment: Appointment | null
  patients: Patient[]
  dentists: Dentist[]
  onRequestDelete?: (appointment: Appointment) => void
}) {
  const { t } = useTranslation()
  const create = useCreateAppointment()
  const update = useUpdateAppointment()
  const isEdit = !!appointment
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [confirmClose, setConfirmClose] = useState(false)
  const comboOpenRef = useRef(false)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: toForm(null, null),
  })

  useEffect(() => {
    if (open) {
      setErrorMsg(null)
      reset(toForm(appointment, null))
    }
  }, [open, appointment, reset])

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
      reason: data.reason || null,
    }
    setErrorMsg(null)
    try {
      if (isEdit && appointment) await update.mutateAsync({ id: appointment.id, data: payload })
      else await create.mutateAsync(payload)
      reset(data)
      onOpenChange(false)
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) setErrorMsg(t('appointments.conflict'))
      else setErrorMsg(t('appointments.saveError'))
    }
  })

  const onDeleteAppointment = () => {
    if (appointment) onRequestDelete?.(appointment)
  }

  const activeDentists = dentists.filter((d) => d.isActive)
  const submitting = create.isPending || update.isPending

  const requestOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDirty && !submitting) {
      setConfirmClose(true)
      return
    }
    onOpenChange(nextOpen)
  }

  useEffect(() => {
    if (!open || !isDirty) return undefined

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty, open])

  return (
    <>
    <Dialog open={open} onOpenChange={requestOpenChange}>
      <DialogContent
        className="max-w-lg"
        onEscapeKeyDown={(e) => {
          // Escape with the patient dropdown open should close only the dropdown.
          if (comboOpenRef.current) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? t('appointments.editTitle') : t('appointments.newTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label={t('appointments.patient')} required error={errors.patientId && t('common.required')}>
            <Combobox
              options={patients
                // archived patients aren't bookable, but keep the current one resolvable in edit mode
                .filter((p) => p.status !== 'archived' || p.id === watch('patientId'))
                .map((p) => ({
                  value: p.id,
                  label: `${p.firstName} ${p.lastName}`,
                  sublabel: p.phone ?? undefined,
                }))}
              value={watch('patientId')}
              onChange={(v) => setValue('patientId', v, { shouldDirty: true, shouldValidate: true })}
              placeholder={t('appointments.selectPatient')}
              searchPlaceholder={t('patients.search')}
              emptyText={t('appointments.noPatientMatch')}
              onOpenChange={(o) => { comboOpenRef.current = o }}
            />
          </Field>

          <Field label={t('appointments.dentist')} required error={errors.dentistId && t('common.required')}>
            <Select value={watch('dentistId')} onValueChange={(v) => setValue('dentistId', v, { shouldDirty: true, shouldValidate: true })}>
              <SelectTrigger><SelectValue placeholder={t('appointments.selectDentist')} /></SelectTrigger>
              <SelectContent>
                {activeDentists.map((d) => <SelectItem key={d.id} value={d.id}>{d.fullName}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-3 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
            <Field label={t('appointments.status')} required>
              <Select value={watch('status')} onValueChange={(v) => setValue('status', v as AppointmentFormData['status'], { shouldDirty: true, shouldValidate: true })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`status.appointment.${s}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t('appointments.reason')}>
              <Input className={inputCls} {...register('reason')} />
            </Field>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2.5 text-sm font-medium text-red-600">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            {isEdit ? (
              <Button type="button" variant="outline" onClick={onDeleteAppointment}
                className="border-red-200 text-red-600 hover:bg-red-50">
                <Trash2 className="me-2 h-4 w-4" />
                {t('appointments.delete')}
              </Button>
            ) : <span />}
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => requestOpenChange(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={submitting} className="bg-[#04CF9E] text-white hover:bg-[#03b589]">
                {submitting ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    <UnsavedChangesDialog open={confirmClose} onStay={() => setConfirmClose(false)} onDiscard={() => { setConfirmClose(false); onOpenChange(false) }} />
    </>
  )
}
