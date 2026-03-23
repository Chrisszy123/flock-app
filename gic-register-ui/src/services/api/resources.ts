import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, Resource, ResourceType } from '@/types';

export const resourcesApi = {
  async getResources(params?: { page?: number; limit?: number; type?: ResourceType }) {
    const response = await api.get<ApiResponse<PaginatedResponse<Resource>>>('/resources', { params });
    return response.data;
  },

  async getResource(id: string) {
    const response = await api.get<ApiResponse<Resource>>(`/resources/${id}`);
    return response.data;
  },

  async createResource(data: {
    type: ResourceType;
    title: string;
    description?: string;
    fileUrl?: string;
    price?: number | null;
    excerpt?: string;
    coverUrl?: string;
  }) {
    const response = await api.post<ApiResponse<Resource>>('/resources', data);
    return response.data;
  },

  async updateResource(id: string, data: Partial<Resource>) {
    const response = await api.patch<ApiResponse<Resource>>(`/resources/${id}`, data);
    return response.data;
  },

  async deleteResource(id: string) {
    const response = await api.delete<ApiResponse>(`/resources/${id}`);
    return response.data;
  },
};
