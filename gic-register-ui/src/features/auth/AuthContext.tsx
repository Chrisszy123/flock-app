import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { api, setAccessToken, getAccessToken } from '@/lib/api';
import type { User, AuthState, ApiResponse, RegisterInput, LoginInput } from '@/types';

interface AuthContextType extends AuthState {
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  /**
   * Prevent React 18 StrictMode from running auth init twice
   */
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initAuth = async () => {
      try {
        const storedToken = getAccessToken();

        // 1️⃣ Try existing access token
        if (storedToken) {
          const me = await api.get<ApiResponse<User>>('/auth/me');

          if (me.data.success && me.data.data) {
            setState({
              user: me.data.data,
              accessToken: storedToken,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
        }

        // 2️⃣ Try refresh token
        const refresh = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');

        if (refresh.data.success && refresh.data.data?.accessToken) {
          const token = refresh.data.data.accessToken;
          setAccessToken(token);

          const me = await api.get<ApiResponse<User>>('/auth/me');

          if (me.data.success && me.data.data) {
            setState({
              user: me.data.data,
              accessToken: token,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
        }
      } catch {
        // Not authenticated
      }

      // 3️⃣ Fallback unauthenticated state
      setState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    };

    initAuth();
  }, []);

  const login = useCallback(async (data: LoginInput) => {
    const res = await api.post<ApiResponse<{ user: User; accessToken: string }>>(
      '/auth/login',
      data
    );

    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Login failed');
    }

    const { user, accessToken } = res.data.data;
    setAccessToken(accessToken);

    setState({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const register = useCallback(async (data: RegisterInput) => {
    const res = await api.post<ApiResponse<{ user: User; accessToken: string }>>(
      '/auth/register',
      data
    );

    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Registration failed');
    }

    const { user, accessToken } = res.data.data;
    setAccessToken(accessToken);

    setState({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore
    } finally {
      setAccessToken(null);
      setState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const updateUser = useCallback((user: User) => {
    setState((prev) => ({
      ...prev,
      user,
    }));
  }, []);

  /**
   * Memoized context value to prevent useless rerenders
   */
  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      updateUser,
    }),
    [state, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}