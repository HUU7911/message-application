import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi, userApi } from '../api';
import { ApiError, onUnauthorized, setAuthToken } from '../api/http';
import { clearImageCache } from '../api/media';
import { TOKEN_KEY } from '../config';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => sessionStorage.getItem(TOKEN_KEY) !== null);

  const clear = useCallback(() => {
    setAuthToken(null);
    sessionStorage.removeItem(TOKEN_KEY);
    clearImageCache();
    setToken(null);
    setUser(null);
  }, []);

  // Token hết hạn / bị từ chối ở bất kỳ request nào thì đăng xuất.
  useEffect(() => {
    onUnauthorized(clear);
    return () => onUnauthorized(null);
  }, [clear]);

  // Khôi phục phiên từ lần trước.
  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (!saved) return;
    setAuthToken(saved);
    userApi
      .me()
      .then((me) => {
        setToken(saved);
        setUser(me);
      })
      .catch(clear)
      .finally(() => setLoading(false));
  }, [clear]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await authApi.login(username, password);
    if (!res?.token || res.authenticated === false) {
      throw new ApiError('Tên đăng nhập hoặc mật khẩu không đúng.', 401);
    }
    setAuthToken(res.token);
    try {
      const me = await userApi.me();
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(me);
    } catch (e) {
      setAuthToken(null);
      throw e;
    }
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await authApi.register(username, email, password);
      await login(username, password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    if (token) {
      try {
        await authApi.logout(token);
      } catch {
        // Token có thể đã hết hạn, vẫn xoá phiên ở máy này.
      }
    }
    clear();
  }, [token, clear]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, updateUser: setUser }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải nằm trong <AuthProvider>');
  return ctx;
}
