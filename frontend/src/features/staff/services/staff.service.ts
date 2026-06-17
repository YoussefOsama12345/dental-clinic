import { apiClient } from '@/lib/api-client'
import type { RosterMember, Staff } from '@/types/api'

export interface StaffFilters {
  search?: string
  role?: string
  active?: string
}

export interface RosterFilters {
  search?: string
  role?: string
}

export const staffService = {
  list: async (filters: StaffFilters = {}): Promise<Staff[]> =>
    (await apiClient.get<Staff[]>('/api/staff', { params: filters })).data,
  roster: async (filters: RosterFilters = {}): Promise<RosterMember[]> =>
    (await apiClient.get<RosterMember[]>('/api/staff/roster', { params: filters })).data,
  getById: async (id: string): Promise<Staff> =>
    (await apiClient.get<Staff>(`/api/staff/${id}`)).data,
  create: async (data: Partial<Staff>): Promise<Staff> =>
    (await apiClient.post<Staff>('/api/staff', data)).data,
  update: async (id: string, data: Partial<Staff>): Promise<Staff> =>
    (await apiClient.patch<Staff>(`/api/staff/${id}`, data)).data,
  remove: async (id: string): Promise<{ success: boolean }> =>
    (await apiClient.delete(`/api/staff/${id}`)).data,
}
