import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, userApi } from "../api";
import { setUnauthorizedHandler, tokenStore } from "../api/client";
import { hasScope } from "../lib/jwt";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: User) => void;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(tokenStore.get());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(!!tokenStore.get());

  const clear = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (t: string) => {
    tokenStore.set(t);
    setToken(t);
    try {
      setUser(await userApi.me());
    } catch (e) {
      clear();
      throw e;
    }
  }, [clear]);

  const logout = useCallback(async () => {
    const t = tokenStore.get();
    if (t) await authApi.logout(t).catch(() => undefined);
    clear();
  }, [clear]);

  // Token hết hạn / bị thu hồi → backend trả 401 → đăng xuất
  useEffect(() => {
    setUnauthorizedHandler(clear);
    return () => setUnauthorizedHandler(null);
  }, [clear]);

  useEffect(() => {
    if (!tokenStore.get()) return;
    userApi.me().then(setUser).catch(clear).finally(() => setLoading(false));
  }, [clear]);

  const value = useMemo<AuthState>(
    () => ({ user, token, loading, isAdmin: hasScope(token, "ADMIN"), login, logout, setUser }),
    [user, token, loading, login, logout],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth phải nằm trong AuthProvider");
  return v;
}
