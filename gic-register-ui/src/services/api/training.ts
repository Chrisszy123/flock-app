import { api } from '@/lib/api';
import type { ApiResponse, TrainingModule, TrainingDashboard, TrainingProgress, CreateTrainingModuleInput } from '@/types';

export const trainingApi = {
  // Training dashboard
  async getMyDashboard() {
    const response = await api.get<ApiResponse<TrainingDashboard>>('/training/dashboard');
    return response.data;
  },

  async updateMyProgress(moduleId: string, completed: boolean) {
    const response = await api.patch<ApiResponse<TrainingProgress>>(`/training/progress/${moduleId}`, { completed });
    return response.data;
  },

  // Training modules
  async getModules() {
    const response = await api.get<ApiResponse<TrainingModule[]>>('/training/modules');
    return response.data;
  },

  async getModuleById(id: string) {
    const response = await api.get<ApiResponse<TrainingModule>>(`/training/modules/${id}`);
    return response.data;
  },

  async createModule(data: CreateTrainingModuleInput) {
    const response = await api.post<ApiResponse<TrainingModule>>('/training/modules', data);
    return response.data;
  },

  async updateModule(id: string, data: Partial<CreateTrainingModuleInput>) {
    const response = await api.patch<ApiResponse<TrainingModule>>(`/training/modules/${id}`, data);
    return response.data;
  },

  async deleteModule(id: string) {
    const response = await api.delete<ApiResponse>(`/training/modules/${id}`);
    return response.data;
  },

  // Worker progress management
  async getWorkerProgress(workerId: string) {
    const response = await api.get<ApiResponse<TrainingDashboard>>(`/training/workers/${workerId}/progress`);
    return response.data;
  },

  async updateWorkerProgress(workerId: string, moduleId: string, completed: boolean) {
    const response = await api.patch<ApiResponse<TrainingProgress>>(`/training/workers/${workerId}/progress/${moduleId}`, { completed });
    return response.data;
  },

  async checkCertification(workerId: string) {
    const response = await api.get<ApiResponse<{ certified: boolean }>>(`/training/workers/${workerId}/certification`);
    return response.data;
  },
};
