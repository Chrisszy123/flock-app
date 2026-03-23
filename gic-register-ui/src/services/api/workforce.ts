import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, Directorate, Unit, User } from '@/types';

export const workforceApi = {
  // Directorates
  async getDirectorates(params?: { page?: number; limit?: number }) {
    const response = await api.get<ApiResponse<PaginatedResponse<Directorate>>>('/workforce/directorates', { params });
    return response.data;
  },

  async getDirectorate(id: string) {
    const response = await api.get<ApiResponse<Directorate>>(`/workforce/directorates/${id}`);
    return response.data;
  },

  async createDirectorate(data: { name: string; description?: string }) {
    const response = await api.post<ApiResponse<Directorate>>('/workforce/directorates', data);
    return response.data;
  },

  async updateDirectorate(id: string, data: { name?: string; description?: string }) {
    const response = await api.patch<ApiResponse<Directorate>>(`/workforce/directorates/${id}`, data);
    return response.data;
  },

  async deleteDirectorate(id: string) {
    const response = await api.delete<ApiResponse>(`/workforce/directorates/${id}`);
    return response.data;
  },

  // Units
  async getUnits(params?: { page?: number; limit?: number; directorateId?: string }) {
    const response = await api.get<ApiResponse<PaginatedResponse<Unit>>>('/workforce/units', { params });
    return response.data;
  },

  async getUnit(id: string) {
    const response = await api.get<ApiResponse<Unit>>(`/workforce/units/${id}`);
    return response.data;
  },

  async createUnit(data: { name: string; directorateId: string }) {
    const response = await api.post<ApiResponse<Unit>>('/workforce/units', data);
    return response.data;
  },

  async updateUnit(id: string, data: { name?: string }) {
    const response = await api.patch<ApiResponse<Unit>>(`/workforce/units/${id}`, data);
    return response.data;
  },

  async deleteUnit(id: string) {
    const response = await api.delete<ApiResponse>(`/workforce/units/${id}`);
    return response.data;
  },

  // Worker management
  async getDirectorateWorkers(params?: { page?: number; limit?: number; directorateId?: string }) {
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>('/workforce/directorate-workers', { params });
    return response.data;
  },

  async getUnitWorkers(params?: { page?: number; limit?: number; unitId?: string }) {
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>('/workforce/unit-workers', { params });
    return response.data;
  },

  async assignWorker(userId: string, data: { directorateId?: string | null; unitId?: string | null }) {
    const response = await api.patch<ApiResponse>(`/workforce/workers/${userId}/assign`, data);
    return response.data;
  },

  async suspendWorker(userId: string, data: { isSuspended: boolean; suspensionReason?: string }) {
    const response = await api.patch<ApiResponse>(`/workforce/workers/${userId}/suspend`, data);
    return response.data;
  },

  async createWorkerProfile(data: {
    email: string;
    password: string;
    fullName: string;
    role: string;
    directorateId?: string;
    unitId?: string;
    phone?: string;
    occupation?: string;
  }) {
    const response = await api.post<ApiResponse<User>>('/workforce/workers', data);
    return response.data;
  },
};
