import { api } from '@/lib/api';
import type { ApiResponse, ChurchLocation } from '@/types';

export interface CreateChurchLocationInput {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  isDefault?: boolean;
}

export const locationsApi = {
  async getLocations() {
    const response = await api.get<ApiResponse<ChurchLocation[]>>('/locations');
    return response.data;
  },

  async getDefaultLocation() {
    const response = await api.get<ApiResponse<ChurchLocation | null>>('/locations/default');
    return response.data;
  },

  async getLocationById(id: string) {
    const response = await api.get<ApiResponse<ChurchLocation>>(`/locations/${id}`);
    return response.data;
  },

  async createLocation(data: CreateChurchLocationInput) {
    const response = await api.post<ApiResponse<ChurchLocation>>('/locations', data);
    return response.data;
  },

  async updateLocation(id: string, data: Partial<CreateChurchLocationInput>) {
    const response = await api.patch<ApiResponse<ChurchLocation>>(`/locations/${id}`, data);
    return response.data;
  },

  async deleteLocation(id: string) {
    const response = await api.delete<ApiResponse>(`/locations/${id}`);
    return response.data;
  },
};
