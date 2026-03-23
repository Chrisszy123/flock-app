import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, AdminNotification, Role } from '@/types';

export const notificationsApi = {
  async createNotification(data: { title: string; message: string; targetRole?: Role | null }) {
    const response = await api.post<ApiResponse<AdminNotification>>('/notifications', data);
    return response.data;
  },

  async getNotifications(params?: { page?: number; limit?: number }) {
    const response = await api.get<ApiResponse<PaginatedResponse<AdminNotification>>>('/notifications', { params });
    return response.data;
  },

  async getRecentNotifications(limit: number = 10) {
    const response = await api.get<ApiResponse<AdminNotification[]>>('/notifications/recent', { params: { limit } });
    return response.data;
  },
};
