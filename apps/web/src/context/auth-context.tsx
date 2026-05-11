"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { UserDto } from "@ruleshub/types";
import { getMe, logout as apiLogout } from "@/lib/api/auth";

interface AuthState {
  user: UserDto | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async () => {
    const me = await getMe();
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // best-effort — clear local state regardless
    }
    setUser(null);
  }, []);

  useEffect(() => {
    getMe()
      .then((me) => setUser(me))
      .catch(() => {
        // Any error (401, network, 5xx) → treat as anonymous. The API is
        // authoritative; there's no client-side credential to clear.
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
