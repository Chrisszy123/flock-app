import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ==============================
// Token storage
// ==============================
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// ==============================
// Refresh control (CRITICAL)
// ==============================
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const AUTH_EXCLUDE_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/me',
];

// ==============================
// Request interceptor
// ==============================
api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ==============================
// Response interceptor
// ==============================
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // 🚫 Never retry twice
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // 🚫 Never refresh auth endpoints
    if (
      AUTH_EXCLUDE_PATHS.some((path) =>
        originalRequest.url?.includes(path)
      )
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // 🔒 One refresh at a time
      if (!isRefreshing) {
        isRefreshing = true;

        refreshPromise = axios
          .post<ApiResponse<{ accessToken: string }>>(
            `${API_BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          )
          .then((res) => {
            const token = res.data?.data?.accessToken ?? null;
            if (token) {
              setAccessToken(token);
            }
            return token;
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;

      if (!newToken) {
        setAccessToken(null);
        return Promise.reject(error);
      }

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newToken}`,
      };

      return api(originalRequest);
    } catch {
      setAccessToken(null);
      return Promise.reject(error);
    }
  }
);

// ==============================
// API error handler
// ==============================
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiResponse;
    if (apiError?.errors && apiError.errors.length > 0) {
      return apiError.errors
        .map((e) => `${e.field}: ${e.message}`)
        .join(', ');
    }
    return apiError?.message || error.message || 'An error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};