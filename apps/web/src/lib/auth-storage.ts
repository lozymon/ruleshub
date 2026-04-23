const TOKEN_KEY = 'rh_token';
const SESSION_COOKIE = 'rh_session';

export const authStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Lax; max-age=2592000`;
  },
  clearToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${SESSION_COOKIE}=; path=/; SameSite=Lax; max-age=0`;
  },
};
