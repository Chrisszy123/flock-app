import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, NewsPost, NewsVisibility } from '@/types';

export const newsApi = {
  async getNewsFeed(params?: { page?: number; limit?: number }) {
    const response = await api.get<ApiResponse<PaginatedResponse<NewsPost>>>('/news', { params });
    return response.data;
  },

  async getNewsPost(id: string) {
    const response = await api.get<ApiResponse<NewsPost>>(`/news/${id}`);
    return response.data;
  },

  async createNewsPost(data: { title: string; content: string; visibility?: NewsVisibility }) {
    const response = await api.post<ApiResponse<NewsPost>>('/news', data);
    return response.data;
  },

  async updateNewsPost(id: string, data: { title?: string; content?: string; visibility?: NewsVisibility }) {
    const response = await api.patch<ApiResponse<NewsPost>>(`/news/${id}`, data);
    return response.data;
  },

  async deleteNewsPost(id: string) {
    const response = await api.delete<ApiResponse>(`/news/${id}`);
    return response.data;
  },
};
