import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { staffService, type RosterFilters, type StaffFilters } from '../services/staff.service'
import { getApiErrorMessage } from '@/lib/api-client'
import type { Staff } from '@/types/api'

export const staffKeys = {
  all: ['staff'] as const,
  list: (f: StaffFilters) => ['staff', 'list', f] as const,
  roster: (f: RosterFilters) => ['staff', 'roster', f] as const,
}

export function useStaff(filters: StaffFilters = {}) {
  return useQuery({ queryKey: staffKeys.list(filters), queryFn: () => staffService.list(filters) })
}

export function useRoster(filters: RosterFilters = {}) {
  return useQuery({ queryKey: staffKeys.roster(filters), queryFn: () => staffService.roster(filters) })
}

export function useStaffMember(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['staff', 'detail', id],
    queryFn: () => staffService.getById(id!),
    enabled: !!id && enabled,
  })
}

function useInvalidate() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['staff'] })
    qc.invalidateQueries({ queryKey: ['overview'] })
  }
}

export function useCreateStaff() {
  const invalidate = useInvalidate()
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data: Partial<Staff>) => staffService.create(data),
    onSuccess: (staff) => {
      qc.setQueryData(['staff', 'detail', staff.id], staff)
      invalidate()
      toast.success(t('staff.toast.created', 'Staff member created successfully.'))
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('staff.toast.createFailed', 'Could not create staff member.'))),
  })
}

export function useUpdateStaff() {
  const invalidate = useInvalidate()
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Staff> }) => staffService.update(id, data),
    onSuccess: (staff) => {
      qc.setQueryData(['staff', 'detail', staff.id], staff)
      invalidate()
      toast.success(t('staff.toast.updated', 'Staff member updated successfully.'))
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('staff.toast.updateFailed', 'Could not update staff member.'))),
  })
}

export function useDeleteStaff() {
  const invalidate = useInvalidate()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => staffService.remove(id),
    onSuccess: () => {
      invalidate()
      toast.success(t('staff.toast.deleted', 'Staff member removed successfully.'))
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('staff.toast.deleteFailed', 'Could not remove staff member.'))),
  })
}
