import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { appointmentService, type AppointmentFilters } from '../services/appointments.service'
import { getApiErrorMessage } from '@/lib/api-client'
import type { Appointment } from '@/types/api'

export const appointmentKeys = {
  all: ['appointments'] as const,
  list: (f: AppointmentFilters) => ['appointments', f] as const,
}

export function useAppointments(filters: AppointmentFilters = {}, enabled = true) {
  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: () => appointmentService.list(filters),
    enabled,
  })
}

export function useAppointment(id: string | undefined) {
  return useQuery({
    queryKey: ['appointments', 'detail', id],
    queryFn: () => appointmentService.getById(id!),
    enabled: !!id,
  })
}

function useInvalidate() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['appointments'] })
    qc.invalidateQueries({ queryKey: ['overview'] })
  }
}

export function useCreateAppointment() {
  const invalidate = useInvalidate()
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data: Partial<Appointment>) => appointmentService.create(data),
    onSuccess: (appointment) => {
      qc.setQueryData(['appointments', 'detail', appointment.id], appointment)
      invalidate()
      toast.success(t('appointments.toast.created', 'Appointment created successfully.'))
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('appointments.toast.createFailed', 'Could not create appointment.'))),
  })
}

export function useUpdateAppointment() {
  const invalidate = useInvalidate()
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) => appointmentService.update(id, data),
    onSuccess: (appointment) => {
      qc.setQueryData(['appointments', 'detail', appointment.id], appointment)
      invalidate()
      toast.success(t('appointments.toast.updated', 'Appointment updated successfully.'))
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('appointments.toast.updateFailed', 'Could not update appointment.'))),
  })
}

export function useDeleteAppointment() {
  const invalidate = useInvalidate()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => appointmentService.remove(id),
    onSuccess: () => {
      invalidate()
      toast.success(t('appointments.toast.deleted', 'Appointment deleted successfully.'))
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('appointments.toast.deleteFailed', 'Could not delete appointment.'))),
  })
}
