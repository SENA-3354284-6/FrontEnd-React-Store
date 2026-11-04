import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { authApi } from "../api/auth.api";
import { TOKEN_STORAGE_KEY } from "../api/client";
import { ADMIN_ROLES, type User } from "../types";

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInitializing: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (payload: {
    name: string;
    nickname: string;
    email: string;
    password: string;
    avatarUrl?: string;
  }) => Promise<User>;
  logout: () => void;
  renewSession: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsInitializing(false);
      return;
    }

    let cancelled = false;

    authApi
      .renewToken()
      .then((response) => {
        if (cancelled) return;
        const newToken = response.data?.token ?? token;
        const userData = response.data?.data ?? null;
        if (newToken !== token) {
          localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
        }
        setToken(newToken);
        setUser(userData);
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsInitializing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    const response = await authApi.login(credentials);
    const accessToken = response.data.token;
    const userData = response.data.data;

    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    setToken(accessToken);
    setUser(userData);

    return userData;
  }, []);

  const register = useCallback(
    async (payload: {
      name: string;
      nickname: string;
      email: string;
      password: string;
      avatarUrl?: string;
    }) => {
      await authApi.register(payload);

      const loginResponse = await authApi.login({
        email: payload.email,
        password: payload.password,
      });

      const accessToken = loginResponse.data.token;
      const loggedUser = loginResponse.data.data;

      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
      setToken(accessToken);
      setUser(loggedUser);

      return loggedUser;
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const renewSession = useCallback(async (): Promise<User | null> => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) return null;

    const response = await authApi.renewToken();
    const accessToken = response.data?.token ?? storedToken;
    const userData = response.data?.data ?? null;

    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    setToken(accessToken);
    setUser(userData);

    return userData;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isAdmin: Boolean(user && ADMIN_ROLES.includes(user.role)),
      isInitializing,
      login,
      register,
      logout,
      renewSession,
    }),
    [user, token, isInitializing, login, register, logout, renewSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider");
  }
  return context;
}
