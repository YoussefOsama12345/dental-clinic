import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Award, BadgeCheck, Clock, Phone, Stethoscope } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FormPageShell, FormSection } from '@/components/ui/form-page-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog'
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Pill } from '@/components/ui/pill'
import { dentistSchema, type DentistFormData } from '../schemas/dentists.schema'
import { useCreateDentist, useDentist, useUpdateDentist } from '../hooks/dentists.hook'
import type { Dentist } from '@/types/api'

const EMPTY: DentistFormData = {
  fullName: '', specialty: '', licenseNumber: '', phone: '', email: '',
  yearsExperience: '', qualifications: '', bio: '', workingDays: 'Sunday, Monday, Tuesday, Wednesday, Thursday', workStart: '09:00', workEnd: '17:00', isActive: true,
}

const inputCls =
  'w-full rounded-xl bg-[#f8fafc] ring-1 ring-[#e2e8f0] px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#04CF9E]/30'

function toForm(dentist: Dentist): DentistFormData {
  return {
    fullName: dentist.fullName,
    specialty: dentist.specialty ?? '',
    licenseNumber: dentist.licenseNumber ?? '',
    phone: dentist.phone ?? '',
    email: dentist.email ?? '',
    yearsExperience: dentist.yearsExperience != null ? String(dentist.yearsExperience) : '',
    qualifications: (dentist.qualifications ?? []).join(', '),
    bio: dentist.bio ?? '',
    workingDays: (dentist.workingDays ?? []).join(', '),
    workStart: dentist.workStart ?? '',
    workEnd: dentist.workEnd ?? '',
    isActive: dentist.isActive,
  }
}

const splitList = (value?: string): string[] =>
  (value ?? '').split(',').map((item) => item.trim()).filter(Boolean)

export function DentistFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isEdit = !!id
  const { data: dentist, isLoading } = useDentist(id)
  const create = useCreateDentist()
  const update = useUpdateDentist()
  const [isLeavingAfterSave, setIsLeavingAfterSave] = useState(false)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<DentistFormData>({
    resolver: zodResolver(dentistSchema),
    defaultValues: EMPTY,
  })

  useEffect(() => {
    if (isEdit) {
      if (dentist) reset(toForm(dentist))
    } else {
      reset(EMPTY)
    }
  }, [dentist, isEdit, reset])

  const unsavedChanges = useUnsavedChangesGuard(isDirty && !create.isPending && !update.isPending && !isLeavingAfterSave)

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
      workingDays: splitList(data.workingDays),
      workStart: data.workStart || null,
      workEnd: data.workEnd || null,
      isActive: data.isActive,
    }

    if (isEdit && id) {
      await update.mutateAsync({ id, data: payload })
      reset(data)
      setIsLeavingAfterSave(true)
      navigate(`/dentists/${id}`, { replace: true })
      return
    }

    const created = await create.mutateAsync(payload)
    reset(data)
    setIsLeavingAfterSave(true)
    navigate(`/dentists/${created.id}`, { replace: true })
  })

  if (isEdit && isLoading) {
    return <div className="space-y-4"><div className="h-10 w-40 animate-pulse rounded-xl bg-muted" /><div className="h-72 animate-pulse rounded-3xl bg-muted" /></div>
  }

  return (
    <>
    <FormPageShell
      backHref={isEdit && id ? `/dentists/${id}` : '/dentists'}
      backLabel={t('dentists.backToList')}
      title={isEdit ? t('dentists.editTitle') : t('dentists.newTitle')}
      subtitle={t('pages.dentists.subtitle')}
      cancelHref={isEdit && id ? `/dentists/${id}` : '/dentists'}
      onSubmit={onSubmit}
      submitting={create.isPending || update.isPending}
      sidebar={
        <Card>
          <CardHeader>
            <CardTitle>{watch('fullName') || t('dentists.newTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={watch('isActive') ? 'teal' : 'muted'}>{watch('isActive') ? t('common.active') : t('common.inactive')}</Pill>
              {watch('specialty') ? <Pill tone="muted">{watch('specialty')}</Pill> : null}
            </div>
            <div className="space-y-2">
              <p>{watch('licenseNumber') || t('dentists.licenseNumber')}</p>
              <p>{watch('phone') || t('dentists.phone')}</p>
              <p>{watch('email') || t('dentists.email')}</p>
              <p>{watch('workStart') && watch('workEnd') ? `${watch('workStart')}–${watch('workEnd')}` : t('dentists.hours')}</p>
            </div>
          </CardContent>
        </Card>
      }
    >
      <FormSection title={t('dentists.professionalInfo')} icon={Stethoscope}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t('dentists.fullName')} required error={errors.fullName && t('common.required')} className="md:col-span-2">
            <Input className={inputCls} {...register('fullName')} />
          </Field>
          <Field label={t('dentists.specialty')}>
            <Input className={inputCls} {...register('specialty')} />
          </Field>
          <Field label={t('dentists.licenseNumber')}>
            <Input className={inputCls} {...register('licenseNumber')} />
          </Field>
          <Field label={t('dentists.experience')} error={errors.yearsExperience && t('validation.numbersOnly')}>
            <Input className={inputCls} inputMode="numeric" {...register('yearsExperience')} />
          </Field>
          <Field label={t('dentists.status')} required>
            <div className="flex h-11 items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4">
              <span className="text-sm text-muted-foreground">{watch('isActive') ? t('common.active') : t('common.inactive')}</span>
              <Switch checked={watch('isActive')} onCheckedChange={(checked) => setValue('isActive', checked, { shouldDirty: true, shouldValidate: true })} />
            </div>
          </Field>
        </div>
      </FormSection>

      <FormSection title={t('dentists.contactInfo')} icon={Phone}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t('dentists.phone')} error={errors.phone && t('common.invalidPhone')}>
            <Input className={inputCls} {...register('phone')} />
          </Field>
          <Field label={t('dentists.email')} error={errors.email && t('common.invalidEmail')}>
            <Input className={inputCls} {...register('email')} />
          </Field>
        </div>
      </FormSection>

      <FormSection title={t('dentists.qualificationsTitle')} icon={Award}>
        <Field label={`${t('dentists.qualifications')} — ${t('patients.commaHint')}`}>
          <Input className={inputCls} {...register('qualifications')} />
        </Field>
        <Field label={t('dentists.bio')}>
          <textarea rows={5} className={inputCls} {...register('bio')} />
        </Field>
      </FormSection>

      <FormSection title={t('dentists.schedule')} icon={Clock}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={`${t('staff.workingDays')} — ${t('patients.commaHint')}`} className="md:col-span-2">
            <Input className={inputCls} {...register('workingDays')} />
          </Field>
          <Field label={t('staff.workStart', 'Start time')} error={errors.workStart && String(errors.workStart.message)}>
            <Input type="time" className={inputCls} {...register('workStart')} />
          </Field>
          <Field label={t('staff.workEnd', 'End time')} error={errors.workEnd && String(errors.workEnd.message)}>
            <Input type="time" className={inputCls} {...register('workEnd')} />
          </Field>
        </div>
        <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('dentists.experience')}</p>
            <p className="mt-2 font-medium text-foreground">{watch('yearsExperience') || '—'}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('dentists.status')}</p>
            <p className="mt-2 font-medium text-foreground">{watch('isActive') ? t('common.active') : t('common.inactive')}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-4 sm:col-span-2">
            <div className="flex items-center gap-2 text-[#067356]">
              <BadgeCheck className="h-4 w-4" />
              <span className="font-medium text-foreground">{watch('specialty') || t('dentists.specialty')}</span>
            </div>
          </div>
        </div>
      </FormSection>
    </FormPageShell>
    <UnsavedChangesDialog open={unsavedChanges.open} onStay={unsavedChanges.stay} onDiscard={unsavedChanges.discard} />
    </>
  )
}
