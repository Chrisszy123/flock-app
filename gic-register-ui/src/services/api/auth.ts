import { api } from '@/lib/api';
import type { ApiResponse, User } from '@/types';

export const authApi = {
  async getMe() {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  async refresh() {
    const response = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
    return response.data;
  },

  async logout() {
    const response = await api.post<ApiResponse>('/auth/logout');
    return response.data;
  },

  async logoutAll() {
    const response = await api.post<ApiResponse>('/auth/logout-all');
    return response.data;
  },
};
