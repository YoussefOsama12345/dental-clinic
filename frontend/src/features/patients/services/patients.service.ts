import { apiClient } from '@/lib/api-client'
import type { Paginated, Patient } from '@/types/api'

export interface PatientFilters {
  search?: string
  status?: string
  dentistId?: string
  page?: number
  pageSize?: number
}

export const patientService = {
  list: async (filters: PatientFilters = {}): Promise<Paginated<Patient>> =>
    (await apiClient.get<Paginated<Patient>>('/api/patients', { params: filters })).data,
  getById: async (id: string): Promise<Patient> =>
    (await apiClient.get<Patient>(`/api/patients/${id}`)).data,
  create: async (data: Partial<Patient>): Promise<Patient> =>
    (await apiClient.post<Patient>('/api/patients', data)).data,
  update: async (id: string, data: Partial<Patient>): Promise<Patient> =>
    (await apiClient.patch<Patient>(`/api/patients/${id}`, data)).data,
  remove: async (id: string): Promise<{ success: boolean }> =>
    (await apiClient.delete(`/api/patients/${id}`)).data,
}
