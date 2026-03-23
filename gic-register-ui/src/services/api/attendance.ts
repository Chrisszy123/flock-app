import { api } from '@/lib/api';
import type { ApiResponse, Attendance, PaginatedResponse, CheckInResult, CanCheckInResult } from '@/types';

export const attendanceApi = {
  // Check-in
  async checkIn(data: { latitude: number; longitude: number; eventId?: string }) {
    const response = await api.post<ApiResponse<CheckInResult>>('/attendance/check-in', data);
    return response.data;
  },

  async canCheckIn(params: { latitude: number; longitude: number; eventId?: string }) {
    const response = await api.get<ApiResponse<CanCheckInResult>>('/attendance/can-check-in', { params });
    return response.data;
  },

  // User attendance
  async getMyHistory(params: { page?: number; limit?: number }) {
    const response = await api.get<ApiResponse<PaginatedResponse<Attendance>>>('/attendance/my-history', { params });
    return response.data;
  },

  async getLastCheckIn() {
    const response = await api.get<ApiResponse<Attendance | null>>('/attendance/last-check-in');
    return response.data;
  },

  // Admin/Leader attendance
  async getAttendance(params: {
    eventId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get<ApiResponse<PaginatedResponse<Attendance>>>('/attendance', { params });
    return response.data;
  },

  async getRecentCheckIns(limit: number = 10) {
    const response = await api.get<ApiResponse<Attendance[]>>('/attendance/recent', { params: { limit } });
    return response.data;
  },

  async getUserAttendance(userId: string, params: { page?: number; limit?: number }) {
    const response = await api.get<ApiResponse<PaginatedResponse<Attendance>>>(`/attendance/user/${userId}`, { params });
    return response.data;
  },

  async getEventAttendance(eventId: string, params: { page?: number; limit?: number }) {
    const response = await api.get<ApiResponse<{ event: Event; attendance: PaginatedResponse<Attendance> }>>(`/attendance/event/${eventId}`, { params });
    return response.data;
  },
};
