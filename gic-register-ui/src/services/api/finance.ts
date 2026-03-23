import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, TitheOffering, TitheStats, PaymentMethod, PaymentStatus } from '@/types';

export const financeApi = {
  async submitOffering(data: {
    amount: number;
    method: PaymentMethod;
    transactionReference?: string;
    cryptoWalletAddress?: string;
    proofImageUrl?: string;
  }) {
    const response = await api.post<ApiResponse<TitheOffering>>('/finance', data);
    return response.data;
  },

  async getMyOfferings(params?: { page?: number; limit?: number }) {
    const response = await api.get<ApiResponse<PaginatedResponse<TitheOffering>>>('/finance/my', { params });
    return response.data;
  },

  async getAllOfferings(params?: { page?: number; limit?: number; method?: PaymentMethod; status?: PaymentStatus }) {
    const response = await api.get<ApiResponse<PaginatedResponse<TitheOffering>>>('/finance/all', { params });
    return response.data;
  },

  async confirmPayment(id: string) {
    const response = await api.patch<ApiResponse<TitheOffering>>(`/finance/${id}/confirm`, { status: 'CONFIRMED' });
    return response.data;
  },

  async getStats(params?: { startDate?: string; endDate?: string }) {
    const response = await api.get<ApiResponse<TitheStats>>('/finance/stats', { params });
    return response.data;
  },
};
