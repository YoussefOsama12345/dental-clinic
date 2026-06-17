import { apiClient } from '@/lib/api-client'
import type { Dentist } from '@/types/api'

export interface DentistFilters {
  search?: string
  specialty?: string
  active?: string
}

export const dentistService = {
  list: async (filters: DentistFilters = {}): Promise<Dentist[]> =>
    (await apiClient.get<Dentist[]>('/api/dentists', { params: filters })).data,
  getById: async (id: string): Promise<Dentist> =>
    (await apiClient.get<Dentist>(`/api/dentists/${id}`)).data,
  create: async (data: Partial<Dentist>): Promise<Dentist> =>
    (await apiClient.post<Dentist>('/api/dentists', data)).data,
  update: async (id: string, data: Partial<Dentist>): Promise<Dentist> =>
    (await apiClient.patch<Dentist>(`/api/dentists/${id}`, data)).data,
  remove: async (id: string): Promise<{ success: boolean }> =>
    (await apiClient.delete(`/api/dentists/${id}`)).data,
}
