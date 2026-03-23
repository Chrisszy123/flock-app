import { api } from '@/lib/api';
import type { ApiResponse, User, PaginatedResponse, UpdateProfileInput, Role, WorkerStatus, WorkerWithProgress } from '@/types';

export const usersApi = {
  // Profile
  async getProfile() {
    const response = await api.get<ApiResponse<User>>('/users/profile');
    return response.data;
  },

  async updateProfile(data: UpdateProfileInput) {
    const response = await api.patch<ApiResponse<User>>('/users/profile', data);
    return response.data;
  },

  // Admin - Member directory
  async searchMembers(params: { search?: string; role?: Role; page?: number; limit?: number }) {
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>('/users', { params });
    return response.data;
  },

  async getUserById(id: string) {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  async updateUserRole(id: string, role: Role) {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}/role`, { role });
    return response.data;
  },

  async updateWorkerStatus(id: string, workerStatus: WorkerStatus) {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}/worker-status`, { workerStatus });
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await api.delete<ApiResponse>(`/users/${id}`);
    return response.data;
  },

  // Workers
  async getWorkers(params: { page?: number; limit?: number }) {
    const response = await api.get<ApiResponse<PaginatedResponse<WorkerWithProgress>>>('/users/workers', { params });
    return response.data;
  },

  async getWorkerProfile(id: string) {
    const response = await api.get<ApiResponse<User>>(`/users/workers/${id}`);
    return response.data;
  },
};
