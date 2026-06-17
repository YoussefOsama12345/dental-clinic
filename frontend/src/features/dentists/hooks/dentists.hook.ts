import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { dentistService, type DentistFilters } from '../services/dentists.service'
import { getApiErrorMessage } from '@/lib/api-client'
import type { Dentist } from '@/types/api'

export const dentistKeys = {
  all: ['dentists'] as const,
  list: (f: DentistFilters) => ['dentists', f] as const,
}

export function useDentists(filters: DentistFilters = {}) {
  return useQuery({
    queryKey: dentistKeys.list(filters),
    queryFn: () => dentistService.list(filters),
  })
}

export function useDentist(id: string | undefined) {
  return useQuery({
    queryKey: ['dentists', 'detail', id],
    queryFn: () => dentistService.getById(id!),
    enabled: !!id,
  })
}

function useInvalidate() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['dentists'] })
    qc.invalidateQueries({ queryKey: ['overview'] })
  }
}

export function useCreateDentist() {
  const invalidate = useInvalidate()
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data: Partial<Dentist>) => dentistService.create(data),
    onSuccess: (dentist) => {
      qc.setQueryData(['dentists', 'detail', dentist.id], dentist)
      invalidate()
      toast.success(t('dentists.toast.created', 'Dentist created successfully.'))
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('dentists.toast.createFailed', 'Could not create dentist.'))),
  })
}

export function useUpdateDentist() {
  const invalidate = useInvalidate()
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Dentist> }) => dentistService.update(id, data),
    onSuccess: (dentist) => {
      qc.setQueryData(['dentists', 'detail', dentist.id], dentist)
      invalidate()
      toast.success(t('dentists.toast.updated', 'Dentist updated successfully.'))
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('dentists.toast.updateFailed', 'Could not update dentist.'))),
  })
}

export function useDeleteDentist() {
  const invalidate = useInvalidate()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => dentistService.remove(id),
    onSuccess: () => {
      invalidate()
      toast.success(t('dentists.toast.deactivated', 'Dentist deactivated successfully.'))
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('dentists.toast.deactivateFailed', 'Could not deactivate dentist.'))),
  })
}
