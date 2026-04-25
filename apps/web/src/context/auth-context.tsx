"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { UserDto } from "@ruleshub/types";
import { authStorage } from "@/lib/auth-storage";
import { getMe } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

interface AuthState {
  user: UserDto | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (newToken: string) => {
    authStorage.setToken(newToken);
    setToken(newToken);
    const me = await getMe(newToken);
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    authStorage.clearToken();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const stored = authStorage.getToken();
    if (!stored) {
      setLoading(false);
      return;
    }
    getMe(stored)
      .then((me) => {
        setToken(stored);
        setUser(me);
      })
      .catch((err) => {
        // Only clear the token on 401 — network failures should not log the user out
        if (err instanceof ApiError && err.status === 401) {
          authStorage.clearToken();
        } else {
          setToken(stored);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
