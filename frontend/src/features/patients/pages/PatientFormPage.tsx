import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HeartPulse, Phone, Stethoscope, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FormPageShell, FormSection } from '@/components/ui/form-page-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog'
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Pill } from '@/components/ui/pill'
import { patientSchema, type PatientFormData } from '../schemas/patients.schema'
import { useCreatePatient, usePatient, useUpdatePatient } from '../hooks/patients.hook'
import { useDentists } from '@/features/dentists/hooks/dentists.hook'
import type { Dentist, Patient } from '@/types/api'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const

const EMPTY: PatientFormData = {
  firstName: '', lastName: '', gender: 'unspecified', dateOfBirth: '', phone: '',
  email: '', address: '',
  bloodType: 'none', smoker: false, allergies: '', chronicConditions: '', medications: '', medicalNotes: '',
  emergencyContactName: '', emergencyContactPhone: '',
  primaryDentistId: 'none', status: 'active',
}

const inputCls =
  'w-full rounded-xl bg-[#f8fafc] ring-1 ring-[#e2e8f0] px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#04CF9E]/30'

function toForm(patient: Patient): PatientFormData {
  return {
    firstName: patient.firstName,
    lastName: patient.lastName,
    gender: patient.gender,
    dateOfBirth: patient.dateOfBirth ?? '',
    phone: patient.phone ?? '',
    email: patient.email ?? '',
    address: patient.address ?? '',
    bloodType: patient.bloodType ?? 'none',
    smoker: patient.smoker,
    allergies: (patient.allergies ?? []).join(', '),
    chronicConditions: (patient.chronicConditions ?? []).join(', '),
    medications: (patient.medications ?? []).join(', '),
    medicalNotes: patient.medicalNotes ?? '',
    emergencyContactName: patient.emergencyContactName ?? '',
    emergencyContactPhone: patient.emergencyContactPhone ?? '',
    primaryDentistId: patient.primaryDentistId ?? 'none',
    status: patient.status,
  }
}

const splitList = (value?: string): string[] =>
  (value ?? '').split(',').map((item) => item.trim()).filter(Boolean)

export function PatientFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isEdit = !!id
  const { data: patient, isLoading } = usePatient(id)
  const { data: dentists = [] } = useDentists({})
  const create = useCreatePatient()
  const update = useUpdatePatient()
  const [isLeavingAfterSave, setIsLeavingAfterSave] = useState(false)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: EMPTY,
  })

  useEffect(() => {
    if (isEdit) {
      if (patient) reset(toForm(patient))
    } else {
      reset(EMPTY)
    }
  }, [isEdit, patient, reset])

  const unsavedChanges = useUnsavedChangesGuard(isDirty && !create.isPending && !update.isPending && !isLeavingAfterSave)

  const onSubmit = handleSubmit(async (data) => {
    const payload: Partial<Patient> = {
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth || null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      bloodType: data.bloodType && data.bloodType !== 'none' ? (data.bloodType as Patient['bloodType']) : null,
      smoker: data.smoker,
      allergies: splitList(data.allergies),
      chronicConditions: splitList(data.chronicConditions),
      medications: splitList(data.medications),
      medicalNotes: data.medicalNotes || null,
      emergencyContactName: data.emergencyContactName || null,
      emergencyContactPhone: data.emergencyContactPhone || null,
      primaryDentistId: data.primaryDentistId && data.primaryDentistId !== 'none' ? data.primaryDentistId : null,
      status: data.status,
    }

    if (isEdit && id) {
      await update.mutateAsync({ id, data: payload })
      reset(data)
      setIsLeavingAfterSave(true)
      navigate(`/patients/${id}`, { replace: true })
      return
    }

    const created = await create.mutateAsync(payload)
    reset(data)
    setIsLeavingAfterSave(true)
    navigate(`/patients/${created.id}`, { replace: true })
  })

  const activeDentists = dentists.filter((dentist) => dentist.isActive)
  const fullName = `${watch('firstName')} ${watch('lastName')}`.trim()
  const selectedDentist = activeDentists.find((dentist) => dentist.id === watch('primaryDentistId'))

  if (isEdit && isLoading) {
    return <div className="space-y-4"><div className="h-10 w-40 animate-pulse rounded-xl bg-muted" /><div className="h-72 animate-pulse rounded-3xl bg-muted" /></div>
  }

  return (
    <>
    <FormPageShell
      backHref={isEdit && id ? `/patients/${id}` : '/patients'}
      backLabel={t('patients.backToList')}
      title={isEdit ? t('patients.editTitle') : t('patients.newTitle')}
      subtitle={t('pages.patients.subtitle')}
      cancelHref={isEdit && id ? `/patients/${id}` : '/patients'}
      onSubmit={onSubmit}
      submitting={create.isPending || update.isPending}
      sidebar={
        <Card>
          <CardHeader>
            <CardTitle>{fullName || t('patients.newTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={watch('status') === 'active' ? 'teal' : 'muted'}>{t(`status.patient.${watch('status')}`)}</Pill>
              <Pill tone="muted">{t(`gender.${watch('gender')}`)}</Pill>
            </div>
            <div className="space-y-2">
              <p>{watch('phone') || t('patients.phone')}</p>
              <p>{watch('email') || t('patients.email')}</p>
              <p>{selectedDentist?.fullName || t('patients.primaryDentist')}</p>
            </div>
          </CardContent>
        </Card>
      }
    >
      <FormSection title={t('patients.personalInfo')} icon={UserRound}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t('patients.firstName')} required error={errors.firstName && t('common.required')}>
            <Input className={inputCls} {...register('firstName')} />
          </Field>
          <Field label={t('patients.lastName')} required error={errors.lastName && t('common.required')}>
            <Input className={inputCls} {...register('lastName')} />
          </Field>
          <Field label={t('patients.gender')} required>
            <Select value={watch('gender')} onValueChange={(value) => setValue('gender', value as PatientFormData['gender'], { shouldDirty: true, shouldValidate: true })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t('gender.male')}</SelectItem>
                <SelectItem value="female">{t('gender.female')}</SelectItem>
                <SelectItem value="other">{t('gender.other')}</SelectItem>
                <SelectItem value="unspecified">{t('gender.unspecified')}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={t('patients.dateOfBirth')}>
            <Input type="date" className={inputCls} {...register('dateOfBirth')} />
          </Field>
          <Field label={t('patients.phone')} error={errors.phone && t('common.invalidPhone')}>
            <Input className={inputCls} {...register('phone')} />
          </Field>
          <Field label={t('patients.email')} error={errors.email && t('common.invalidEmail')}>
            <Input className={inputCls} {...register('email')} />
          </Field>
          <Field label={t('patients.primaryDentist')}>
            <Select value={watch('primaryDentistId')} onValueChange={(value) => setValue('primaryDentistId', value, { shouldDirty: true, shouldValidate: true })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('common.none')}</SelectItem>
                {activeDentists.map((dentist: Dentist) => (
                  <SelectItem key={dentist.id} value={dentist.id}>{dentist.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t('patients.status')} required>
            <Select value={watch('status')} onValueChange={(value) => setValue('status', value as PatientFormData['status'], { shouldDirty: true, shouldValidate: true })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('status.patient.active')}</SelectItem>
                <SelectItem value="inactive">{t('status.patient.inactive')}</SelectItem>
                <SelectItem value="archived">{t('status.patient.archived')}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label={t('patients.address')}>
          <Input className={inputCls} {...register('address')} />
        </Field>
      </FormSection>

      <FormSection title={t('patients.medicalProfile')} icon={HeartPulse}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t('patients.bloodType')}>
            <Select value={watch('bloodType')} onValueChange={(value) => setValue('bloodType', value as PatientFormData['bloodType'], { shouldDirty: true, shouldValidate: true })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('common.none')}</SelectItem>
                {BLOOD_TYPES.map((bloodType) => <SelectItem key={bloodType} value={bloodType}>{bloodType}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t('patients.smoker')}>
            <div className="flex h-11 items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4">
              <span className="text-sm text-muted-foreground">{watch('smoker') ? t('common.yes') : t('common.no')}</span>
              <Switch checked={watch('smoker')} onCheckedChange={(checked) => setValue('smoker', checked, { shouldDirty: true, shouldValidate: true })} />
            </div>
          </Field>
        </div>

        <Field label={`${t('patients.allergies')} — ${t('patients.commaHint')}`}>
          <Input className={inputCls} {...register('allergies')} />
        </Field>

        <Field label={`${t('patients.chronicConditions')} — ${t('patients.commaHint')}`}>
          <Input className={inputCls} {...register('chronicConditions')} />
        </Field>

        <Field label={`${t('patients.medications')} — ${t('patients.commaHint')}`}>
          <Input className={inputCls} {...register('medications')} />
        </Field>

        <Field label={t('patients.medicalNotes')}>
          <textarea rows={4} className={inputCls} {...register('medicalNotes')} />
        </Field>
      </FormSection>

      <FormSection title={t('patients.emergencyContactSection')} icon={Phone}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t('patients.emergencyName')}>
            <Input className={inputCls} {...register('emergencyContactName')} />
          </Field>
          <Field label={t('patients.emergencyPhone')} error={errors.emergencyContactPhone && t('common.invalidPhone')}>
            <Input className={inputCls} {...register('emergencyContactPhone')} />
          </Field>
        </div>
      </FormSection>

      <FormSection title={t('patients.primaryDentist')} icon={Stethoscope}>
        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('patients.primaryDentist')}</p>
            <p className="mt-2 font-medium text-foreground">{selectedDentist?.fullName || t('common.none')}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('patients.status')}</p>
            <p className="mt-2 font-medium text-foreground">{t(`status.patient.${watch('status')}`)}</p>
          </div>
        </div>
      </FormSection>
    </FormPageShell>
    <UnsavedChangesDialog open={unsavedChanges.open} onStay={unsavedChanges.stay} onDiscard={unsavedChanges.discard} />
    </>
  )
}
