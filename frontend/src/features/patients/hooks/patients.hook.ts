import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { patientService, type PatientFilters } from '../services/patients.service'
import { getApiErrorMessage } from '@/lib/api-client'
import type { Patient } from '@/types/api'

export const patientKeys = {
  all: ['patients'] as const,
  list: (f: PatientFilters) => ['patients', f] as const,
}

export function usePatients(filters: PatientFilters = {}) {
  return useQuery({
    queryKey: patientKeys.list(filters),
    queryFn: () => patientService.list(filters),
    // keep the previous page on screen while the next one loads
    placeholderData: keepPreviousData,
  })
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ['patients', 'detail', id],
    queryFn: () => patientService.getById(id!),
    enabled: !!id,
  })
}

function useInvalidate() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['patients'] })
    qc.invalidateQueries({ queryKey: ['overview'] })
  }
}

export function useCreatePatient() {
  const invalidate = useInvalidate()
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data: Partial<Patient>) => patientService.create(data),
    onSuccess: (patient) => {
      qc.setQueryData(['patients', 'detail', patient.id], patient)
      invalidate()
      toast.success(t('patients.toast.created', 'Patient created successfully.'))
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('patients.toast.createFailed', 'Could not create patient.'))),
  })
}

export function useUpdatePatient() {
  const invalidate = useInvalidate()
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) => patientService.update(id, data),
    onSuccess: (patient) => {
      qc.setQueryData(['patients', 'detail', patient.id], patient)
      invalidate()
      toast.success(t('patients.toast.updated', 'Patient updated successfully.'))
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('patients.toast.updateFailed', 'Could not update patient.'))),
  })
}

export function useDeletePatient() {
  const invalidate = useInvalidate()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => patientService.remove(id),
    onSuccess: () => {
      invalidate()
      toast.success(t('patients.toast.deleted', 'Patient archived successfully.'))
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('patients.toast.deleteFailed', 'Could not archive patient.'))),
  })
}
