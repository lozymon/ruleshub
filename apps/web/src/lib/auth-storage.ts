// The actual credential is an httpOnly cookie (`rh_auth`) set by the API and
// only readable by the API. `rh_session` is a non-credential UX hint set by
// the web app so Next.js middleware can redirect unauthenticated users away
// from protected routes without a round-trip to the API. Anyone can spoof
// this cookie — it must never be trusted for authorization.
const SESSION_COOKIE = "rh_session";

export const authStorage = {
  markSignedIn: (): void => {
    document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Lax; max-age=2592000`;
  },
  markSignedOut: (): void => {
    document.cookie = `${SESSION_COOKIE}=; path=/; SameSite=Lax; max-age=0`;
  },
};
