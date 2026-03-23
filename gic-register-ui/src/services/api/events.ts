import { api } from '@/lib/api';
import type { ApiResponse, Event, PaginatedResponse, CreateEventInput, Attendance } from '@/types';

export const eventsApi = {
  // Events CRUD
  async getEvents(params: { page?: number; limit?: number }) {
    const response = await api.get<ApiResponse<PaginatedResponse<Event>>>('/events', { params });
    return response.data;
  },

  async getUpcomingEvents(limit: number = 10) {
    const response = await api.get<ApiResponse<Event[]>>('/events/upcoming', { params: { limit } });
    return response.data;
  },

  async getEventById(id: string) {
    const response = await api.get<ApiResponse<Event>>(`/events/${id}`);
    return response.data;
  },

  async getEventWithAttendance(id: string) {
    const response = await api.get<ApiResponse<Event & { attendances: Attendance[] }>>(`/events/${id}/attendance`);
    return response.data;
  },

  async createEvent(data: CreateEventInput) {
    const response = await api.post<ApiResponse<Event>>('/events', data);
    return response.data;
  },

  async updateEvent(id: string, data: Partial<CreateEventInput>) {
    const response = await api.patch<ApiResponse<Event>>(`/events/${id}`, data);
    return response.data;
  },

  async deleteEvent(id: string) {
    const response = await api.delete<ApiResponse>(`/events/${id}`);
    return response.data;
  },
};
