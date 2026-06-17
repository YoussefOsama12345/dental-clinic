import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Mail, ShieldCheck, UserCog } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FormPageShell, FormSection } from '@/components/ui/form-page-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog'
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pill } from '@/components/ui/pill'
import { staffSchema, type StaffFormData } from '../schemas/staff.schema'
import { useCreateStaff, useStaffMember, useUpdateStaff } from '../hooks/staff.hook'
import type { Staff } from '@/types/api'

const EMPTY: StaffFormData = { fullName: '', role: 'reception', phone: '', email: '', status: 'active', workingDays: 'Sunday, Monday, Tuesday, Wednesday, Thursday', workStart: '09:00', workEnd: '17:00' }
const ROLES = ['reception', 'nurse', 'assistant', 'manager', 'accountant', 'other'] as const
const STATUSES = ['active', 'on_leave', 'inactive'] as const

const ROLE_PERMISSION_KEYS: Record<StaffFormData['role'], string[]> = {
  reception: ['manageAppointments', 'registerPatients', 'viewPatientContact'],
  nurse: ['viewAppointments', 'prepareClinicalNotes', 'updateVisitStatus'],
  assistant: ['assistDentistWorkflow', 'viewDailySchedule', 'prepareTreatmentRoom'],
  manager: ['manageStaff', 'viewOperationalReports', 'manageClinicSettings'],
  accountant: ['manageInvoices', 'recordPayments', 'exportFinancialReports'],
  other: ['viewAssignedWorkQueue'],
}

const inputCls =
  'w-full rounded-xl bg-[#f8fafc] ring-1 ring-[#e2e8f0] px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#04CF9E]/30'

function toForm(member: Staff): StaffFormData {
  return {
    fullName: member.fullName,
    role: member.role,
    phone: member.phone ?? '',
    email: member.email ?? '',
    status: member.status,
    workingDays: (member.workingDays ?? []).join(', '),
    workStart: member.workStart ?? '',
    workEnd: member.workEnd ?? '',
  }
}

const splitList = (value?: string): string[] =>
  (value ?? '').split(',').map((item) => item.trim()).filter(Boolean)

export function StaffFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isEdit = !!id
  const { data: member, isLoading } = useStaffMember(id)
  const create = useCreateStaff()
  const update = useUpdateStaff()
  const [isLeavingAfterSave, setIsLeavingAfterSave] = useState(false)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: EMPTY,
  })

  useEffect(() => {
    if (isEdit) {
      if (member) reset(toForm(member))
    } else {
      reset(EMPTY)
    }
  }, [isEdit, member, reset])

  const unsavedChanges = useUnsavedChangesGuard(isDirty && !create.isPending && !update.isPending && !isLeavingAfterSave)

  const onSubmit = handleSubmit(async (data) => {
    const payload: Partial<Staff> = {
      fullName: data.fullName,
      role: data.role,
      phone: data.phone || null,
      email: data.email || null,
      status: data.status,
      workingDays: splitList(data.workingDays),
      workStart: data.workStart || null,
      workEnd: data.workEnd || null,
    }

    if (isEdit && id) {
      await update.mutateAsync({ id, data: payload })
      reset(data)
      setIsLeavingAfterSave(true)
      navigate(`/staff/${id}`, { replace: true })
      return
    }

    const created = await create.mutateAsync(payload)
    reset(data)
    setIsLeavingAfterSave(true)
    navigate(`/staff/${created.id}`, { replace: true })
  })

  if (isEdit && isLoading) {
    return <div className="space-y-4"><div className="h-10 w-40 animate-pulse rounded-xl bg-muted" /><div className="h-72 animate-pulse rounded-3xl bg-muted" /></div>
  }

  return (
    <>
    <FormPageShell
      backHref={isEdit && id ? `/staff/${id}` : '/staff'}
      backLabel={t('staff.backToList')}
      title={isEdit ? t('staff.editTitle') : t('staff.newTitle')}
      subtitle={t('pages.staff.subtitle')}
      cancelHref={isEdit && id ? `/staff/${id}` : '/staff'}
      onSubmit={onSubmit}
      submitting={create.isPending || update.isPending}
      sidebar={
        <Card>
          <CardHeader>
            <CardTitle>{watch('fullName') || t('staff.newTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="muted">{t(`staff.roleOption.${watch('role')}`)}</Pill>
              <Pill tone={watch('status') === 'active' ? 'teal' : 'muted'}>{t(`staff.empStatus.${watch('status')}`)}</Pill>
            </div>
            <div className="space-y-2">
              <p>{watch('phone') || t('staff.phone')}</p>
              <p>{watch('email') || t('staff.email')}</p>
              <p>{watch('workStart') && watch('workEnd') ? `${watch('workStart')}–${watch('workEnd')}` : t('staff.shift')}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('staff.permissions')}</p>
              <ul className="space-y-1 text-xs">
                {ROLE_PERMISSION_KEYS[watch('role')].slice(0, 3).map((permission) => <li key={permission}>• {t(`staff.permission.${permission}`)}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>
      }
    >
      <FormSection title={t('staff.workInfo')} icon={UserCog}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t('staff.fullName')} required error={errors.fullName && t('common.required')} className="md:col-span-2">
            <Input className={inputCls} {...register('fullName')} />
          </Field>
          <Field label={t('staff.role')} required>
            <Select value={watch('role')} onValueChange={(value) => setValue('role', value as StaffFormData['role'], { shouldDirty: true, shouldValidate: true })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => <SelectItem key={role} value={role}>{t(`staff.roleOption.${role}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t('staff.status')} required>
            <Select value={watch('status')} onValueChange={(value) => setValue('status', value as StaffFormData['status'], { shouldDirty: true, shouldValidate: true })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((status) => <SelectItem key={status} value={status}>{t(`staff.empStatus.${status}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </FormSection>

      <FormSection title={t('staff.contactInfo')} icon={Mail}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t('staff.phone')} error={errors.phone && t('common.invalidPhone')}>
            <Input className={inputCls} {...register('phone')} />
          </Field>
          <Field label={t('staff.email')} error={errors.email && t('common.invalidEmail')}>
            <Input className={inputCls} {...register('email')} />
          </Field>
        </div>
      </FormSection>

      <FormSection title={t('staff.tab.schedule')} icon={ShieldCheck}>
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
      </FormSection>

      <FormSection title={t('staff.permissions')} icon={KeyRound}>
        <div className="grid gap-3 sm:grid-cols-2">
          {ROLE_PERMISSION_KEYS[watch('role')].map((permission) => (
            <div key={permission} className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-sm font-medium text-foreground">
              {t(`staff.permission.${permission}`)}
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection title={t('staff.status')} icon={ShieldCheck}>
        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('staff.role')}</p>
            <p className="mt-2 font-medium text-foreground">{t(`staff.roleOption.${watch('role')}`)}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('staff.status')}</p>
            <p className="mt-2 font-medium text-foreground">{t(`staff.empStatus.${watch('status')}`)}</p>
          </div>
        </div>
      </FormSection>
    </FormPageShell>
    <UnsavedChangesDialog open={unsavedChanges.open} onStay={unsavedChanges.stay} onDiscard={unsavedChanges.discard} />
    </>
  )
}
