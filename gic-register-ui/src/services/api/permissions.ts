import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, PermissionRequest } from '@/types';

export const permissionsApi = {
  async submitRequest(data: { reason: string; startDate: string; endDate: string }) {
    const response = await api.post<ApiResponse<PermissionRequest>>('/permissions', data);
    return response.data;
  },

  async getMyRequests(params?: { page?: number; limit?: number }) {
    const response = await api.get<ApiResponse<PaginatedResponse<PermissionRequest>>>('/permissions/my', { params });
    return response.data;
  },

  async getRequest(id: string) {
    const response = await api.get<ApiResponse<PermissionRequest>>(`/permissions/${id}`);
    return response.data;
  },

  async getPendingRequests(params?: { page?: number; limit?: number }) {
    const response = await api.get<ApiResponse<PaginatedResponse<PermissionRequest>>>('/permissions/pending', { params });
    return response.data;
  },

  async getAllRequests(params?: { page?: number; limit?: number; status?: string }) {
    const response = await api.get<ApiResponse<PaginatedResponse<PermissionRequest>>>('/permissions/all', { params });
    return response.data;
  },

  async decideRequest(id: string, data: { status: 'APPROVED' | 'DECLINED'; decisionReason: string }) {
    const response = await api.patch<ApiResponse<PermissionRequest>>(`/permissions/${id}/decide`, data);
    return response.data;
  },
};
