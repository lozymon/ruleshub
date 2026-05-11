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
import { getMe, logout as apiLogout } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

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
    authStorage.markSignedIn();
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // best-effort — clear local state regardless
    }
    authStorage.markSignedOut();
    setUser(null);
  }, []);

  useEffect(() => {
    getMe()
      .then((me) => {
        setUser(me);
        authStorage.markSignedIn();
      })
      .catch((err) => {
        // 401 means we're not signed in — leave user null. Other errors
        // (network, 5xx) should also keep user null but not flip the
        // session flag, so a transient outage doesn't show a phantom
        // signed-in state.
        if (err instanceof ApiError && err.status === 401) {
          authStorage.markSignedOut();
        }
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
