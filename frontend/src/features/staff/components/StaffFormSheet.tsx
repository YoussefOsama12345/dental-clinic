import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { FormSheet } from '@/components/ui/form-sheet'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { staffSchema, type StaffFormData } from '../schemas/staff.schema'
import { useCreateStaff, useUpdateStaff, useStaffMember } from '../hooks/staff.hook'
import type { Staff } from '@/types/api'

const EMPTY: StaffFormData = { fullName: '', role: 'reception', phone: '', email: '', status: 'active' }
const ROLES = ['reception', 'nurse', 'assistant', 'manager', 'accountant', 'other'] as const
const STATUSES = ['active', 'on_leave', 'inactive'] as const

function toForm(s: Staff): StaffFormData {
  return { fullName: s.fullName, role: s.role, phone: s.phone ?? '', email: s.email ?? '', status: s.status }
}

const inputCls =
  'w-full rounded-xl bg-[#f8fafc] ring-1 ring-[#e2e8f0] px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#04CF9E]/30'

export function StaffFormSheet({
  open, onOpenChange, staffId,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  staffId: string | null
}) {
  const { t } = useTranslation()
  const create = useCreateStaff()
  const update = useUpdateStaff()
  const isEdit = !!staffId
  const { data: member } = useStaffMember(staffId ?? undefined, open && !!staffId)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: EMPTY,
  })

  useEffect(() => {
    if (!open) return
    if (staffId && member) reset(toForm(member))
    else if (!staffId) reset(EMPTY)
  }, [open, staffId, member, reset])

  const onSubmit = handleSubmit(async (data) => {
    const payload: Partial<Staff> = {
      fullName: data.fullName,
      role: data.role,
      phone: data.phone || null,
      email: data.email || null,
      status: data.status,
    }
    if (isEdit && staffId) await update.mutateAsync({ id: staffId, data: payload })
    else await create.mutateAsync(payload)
    reset(data)
    onOpenChange(false)
  })

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t('staff.editTitle') : t('staff.newTitle')}
      onSubmit={onSubmit}
      submitting={create.isPending || update.isPending}
      hasUnsavedChanges={isDirty}
    >
      <Field label={t('staff.fullName')} required error={errors.fullName && t('common.required')}>
        <Input className={inputCls} {...register('fullName')} />
      </Field>

      <Field label={t('staff.role')} required>
        <Select value={watch('role')} onValueChange={(v) => setValue('role', v as StaffFormData['role'], { shouldDirty: true, shouldValidate: true })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => <SelectItem key={r} value={r}>{t(`staff.roleOption.${r}`)}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t('staff.phone')} error={errors.phone && t('common.invalidPhone')}>
          <Input className={inputCls} {...register('phone')} />
        </Field>
        <Field label={t('staff.status')} required>
          <Select value={watch('status')} onValueChange={(v) => setValue('status', v as StaffFormData['status'], { shouldDirty: true, shouldValidate: true })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`staff.empStatus.${s}`)}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label={t('staff.email')} error={errors.email && t('common.invalidEmail')}>
        <Input className={inputCls} {...register('email')} />
      </Field>
    </FormSheet>
  )
}
