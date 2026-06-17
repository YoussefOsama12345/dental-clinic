import { apiClient } from '@/lib/api-client'
import type { Appointment } from '@/types/api'

export interface AppointmentFilters {
  from?: string
  to?: string
  dentistId?: string
  patientId?: string
  status?: string
}

export interface AvailabilityParams {
  dentistId: string
  from: string
  to: string
  excludeAppointmentId?: string
}

export const appointmentService = {
  list: async (filters: AppointmentFilters = {}): Promise<Appointment[]> =>
    (await apiClient.get<Appointment[]>('/api/appointments', { params: filters })).data,
  getById: async (id: string): Promise<Appointment> =>
    (await apiClient.get<Appointment>(`/api/appointments/${id}`)).data,
  create: async (data: Partial<Appointment>): Promise<Appointment> =>
    (await apiClient.post<Appointment>('/api/appointments', data)).data,
  update: async (id: string, data: Partial<Appointment>): Promise<Appointment> =>
    (await apiClient.patch<Appointment>(`/api/appointments/${id}`, data)).data,
  remove: async (id: string): Promise<{ success: boolean }> =>
    (await apiClient.delete(`/api/appointments/${id}`)).data,
  availability: async (params: AvailabilityParams): Promise<{ available: boolean; conflictId: string | null }> =>
    (await apiClient.get('/api/appointments/availability', { params })).data,
}
