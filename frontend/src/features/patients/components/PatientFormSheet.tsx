import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { FormSheet } from '@/components/ui/form-sheet'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { patientSchema, type PatientFormData } from '../schemas/patients.schema'
import { useCreatePatient, useUpdatePatient } from '../hooks/patients.hook'
import type { Dentist, Patient } from '@/types/api'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const

const EMPTY: PatientFormData = {
  firstName: '', lastName: '', gender: 'unspecified', dateOfBirth: '', phone: '',
  email: '', address: '',
  bloodType: 'none', smoker: false, allergies: '', chronicConditions: '', medications: '', medicalNotes: '',
  emergencyContactName: '', emergencyContactPhone: '',
  primaryDentistId: 'none', status: 'active',
}

function toForm(p: Patient): PatientFormData {
  return {
    firstName: p.firstName, lastName: p.lastName, gender: p.gender,
    dateOfBirth: p.dateOfBirth ?? '', phone: p.phone ?? '', email: p.email ?? '',
    address: p.address ?? '',
    bloodType: p.bloodType ?? 'none',
    smoker: p.smoker,
    allergies: (p.allergies ?? []).join(', '),
    chronicConditions: (p.chronicConditions ?? []).join(', '),
    medications: (p.medications ?? []).join(', '),
    medicalNotes: p.medicalNotes ?? '',
    emergencyContactName: p.emergencyContactName ?? '',
    emergencyContactPhone: p.emergencyContactPhone ?? '',
    primaryDentistId: p.primaryDentistId ?? 'none', status: p.status,
  }
}

const splitList = (s?: string): string[] =>
  (s ?? '').split(',').map((x) => x.trim()).filter(Boolean)

const inputCls =
  'w-full rounded-xl bg-[#f8fafc] ring-1 ring-[#e2e8f0] px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#04CF9E]/30'

function Section({ children }: { children: React.ReactNode }) {
  return <p className="pt-2 text-[11px] font-bold uppercase tracking-wider text-[#04A47E]">{children}</p>
}

export function PatientFormSheet({
  open, onOpenChange, patient, dentists,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  patient: Patient | null
  dentists: Dentist[]
}) {
  const { t } = useTranslation()
  const create = useCreatePatient()
  const update = useUpdatePatient()
  const isEdit = !!patient

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: EMPTY,
  })

  useEffect(() => {
    if (open) reset(patient ? toForm(patient) : EMPTY)
  }, [open, patient, reset])

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
    if (isEdit && patient) await update.mutateAsync({ id: patient.id, data: payload })
    else await create.mutateAsync(payload)
    reset(data)
    onOpenChange(false)
  })

  const activeDentists = dentists.filter((d) => d.isActive)

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t('patients.editTitle') : t('patients.newTitle')}
      onSubmit={onSubmit}
      submitting={create.isPending || update.isPending}
      hasUnsavedChanges={isDirty}
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label={t('patients.firstName')} required error={errors.firstName && t('common.required')}>
          <Input className={inputCls} {...register('firstName')} />
        </Field>
        <Field label={t('patients.lastName')} required error={errors.lastName && t('common.required')}>
          <Input className={inputCls} {...register('lastName')} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t('patients.gender')} required>
          <Select value={watch('gender')} onValueChange={(v) => setValue('gender', v as PatientFormData['gender'], { shouldDirty: true, shouldValidate: true })}>
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t('patients.phone')} error={errors.phone && t('common.invalidPhone')}>
          <Input className={inputCls} {...register('phone')} />
        </Field>
        <Field label={t('patients.email')} error={errors.email && t('common.invalidEmail')}>
          <Input className={inputCls} {...register('email')} />
        </Field>
      </div>

      <Field label={t('patients.primaryDentist')}>
        <Select value={watch('primaryDentistId')} onValueChange={(v) => setValue('primaryDentistId', v, { shouldDirty: true, shouldValidate: true })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t('common.none')}</SelectItem>
            {activeDentists.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.fullName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label={t('patients.address')}>
        <Input className={inputCls} {...register('address')} />
      </Field>

      {/* ── Medical profile ─────────────────────────────────────────────── */}
      <Section>{t('patients.medicalProfile')}</Section>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t('patients.bloodType')}>
          <Select value={watch('bloodType')} onValueChange={(v) => setValue('bloodType', v as PatientFormData['bloodType'], { shouldDirty: true, shouldValidate: true })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('common.none')}</SelectItem>
              {BLOOD_TYPES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t('patients.smoker')}>
          <div className="flex h-11 items-center gap-3">
            <Switch checked={watch('smoker')} onCheckedChange={(c) => setValue('smoker', c, { shouldDirty: true, shouldValidate: true })} />
            <span className="text-sm text-muted-foreground">
              {watch('smoker') ? t('common.yes') : t('common.no')}
            </span>
          </div>
        </Field>
      </div>

      <Field label={`${t('patients.allergies')} — ${t('patients.commaHint')}`}>
        <Input className={inputCls} placeholder="Penicillin, Latex…" {...register('allergies')} />
      </Field>

      <Field label={`${t('patients.chronicConditions')} — ${t('patients.commaHint')}`}>
        <Input className={inputCls} placeholder="Hypertension…" {...register('chronicConditions')} />
      </Field>

      <Field label={`${t('patients.medications')} — ${t('patients.commaHint')}`}>
        <Input className={inputCls} placeholder="Metformin…" {...register('medications')} />
      </Field>

      <Field label={t('patients.medicalNotes')}>
        <textarea rows={3} className={inputCls} {...register('medicalNotes')} />
      </Field>

      {/* ── Emergency contact ───────────────────────────────────────────── */}
      <Section>{t('patients.emergencyContactSection')}</Section>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t('patients.emergencyName')}>
          <Input className={inputCls} {...register('emergencyContactName')} />
        </Field>
        <Field label={t('patients.emergencyPhone')} error={errors.emergencyContactPhone && t('common.invalidPhone')}>
          <Input className={inputCls} {...register('emergencyContactPhone')} />
        </Field>
      </div>

      <Field label={t('patients.status')} required>
        <Select value={watch('status')} onValueChange={(v) => setValue('status', v as PatientFormData['status'], { shouldDirty: true, shouldValidate: true })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{t('status.patient.active')}</SelectItem>
            <SelectItem value="inactive">{t('status.patient.inactive')}</SelectItem>
            <SelectItem value="archived">{t('status.patient.archived')}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </FormSheet>
  )
}
