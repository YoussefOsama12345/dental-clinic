import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { FormSheet } from '@/components/ui/form-sheet'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { dentistSchema, type DentistFormData } from '../schemas/dentists.schema'
import { useCreateDentist, useUpdateDentist } from '../hooks/dentists.hook'
import type { Dentist } from '@/types/api'

const EMPTY: DentistFormData = {
  fullName: '', specialty: '', licenseNumber: '', phone: '', email: '',
  yearsExperience: '', qualifications: '', bio: '', isActive: true,
}

function toForm(d: Dentist): DentistFormData {
  return {
    fullName: d.fullName, specialty: d.specialty ?? '', licenseNumber: d.licenseNumber ?? '',
    phone: d.phone ?? '', email: d.email ?? '',
    yearsExperience: d.yearsExperience != null ? String(d.yearsExperience) : '',
    qualifications: (d.qualifications ?? []).join(', '),
    bio: d.bio ?? '',
    isActive: d.isActive,
  }
}

const splitList = (s?: string): string[] =>
  (s ?? '').split(',').map((x) => x.trim()).filter(Boolean)

const inputCls =
  'w-full rounded-xl bg-[#f8fafc] ring-1 ring-[#e2e8f0] px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#04CF9E]/30'

export function DentistFormSheet({
  open, onOpenChange, dentist,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  dentist: Dentist | null
}) {
  const { t } = useTranslation()
  const create = useCreateDentist()
  const update = useUpdateDentist()
  const isEdit = !!dentist

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<DentistFormData>({
    resolver: zodResolver(dentistSchema),
    defaultValues: EMPTY,
  })

  useEffect(() => {
    if (open) reset(dentist ? toForm(dentist) : EMPTY)
  }, [open, dentist, reset])

  const onSubmit = handleSubmit(async (data) => {
    const years = data.yearsExperience ? Number(data.yearsExperience) : NaN
    const payload: Partial<Dentist> = {
      fullName: data.fullName,
      specialty: data.specialty || null,
      licenseNumber: data.licenseNumber || null,
      phone: data.phone || null,
      email: data.email || null,
      yearsExperience: Number.isFinite(years) ? years : null,
      qualifications: splitList(data.qualifications),
      bio: data.bio || null,
      isActive: data.isActive,
    }
    if (isEdit && dentist) await update.mutateAsync({ id: dentist.id, data: payload })
    else await create.mutateAsync(payload)
    reset(data)
    onOpenChange(false)
  })

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t('dentists.editTitle') : t('dentists.newTitle')}
      onSubmit={onSubmit}
      submitting={create.isPending || update.isPending}
      hasUnsavedChanges={isDirty}
    >
      <Field label={t('dentists.fullName')} required error={errors.fullName && t('common.required')}>
        <Input className={inputCls} {...register('fullName')} />
      </Field>

      <Field label={t('dentists.specialty')}>
        <Input className={inputCls} {...register('specialty')} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t('dentists.licenseNumber')}>
          <Input className={inputCls} {...register('licenseNumber')} />
        </Field>
        <Field label={t('dentists.phone')} error={errors.phone && t('common.invalidPhone')}>
          <Input className={inputCls} {...register('phone')} />
        </Field>
      </div>

      <Field label={t('dentists.email')} error={errors.email && t('common.invalidEmail')}>
        <Input className={inputCls} {...register('email')} />
      </Field>

      <Field label={t('dentists.experience')} error={errors.yearsExperience && t('validation.numbersOnly')}>
        <Input className={inputCls} inputMode="numeric" placeholder="10" {...register('yearsExperience')} />
      </Field>

      <Field label={`${t('dentists.qualifications')} — ${t('patients.commaHint')}`}>
        <Input className={inputCls} placeholder="BDS, MSc Orthodontics…" {...register('qualifications')} />
      </Field>

      <Field label={t('dentists.bio')}>
        <textarea rows={3} className={inputCls} {...register('bio')} />
      </Field>

      <Field label={t('dentists.status')} required>
        <div className="flex items-center gap-3">
          <Switch checked={watch('isActive')} onCheckedChange={(c) => setValue('isActive', c, { shouldDirty: true, shouldValidate: true })} />
          <span className="text-sm text-muted-foreground">
            {watch('isActive') ? t('common.active') : t('common.inactive')}
          </span>
        </div>
      </Field>
    </FormSheet>
  )
}
