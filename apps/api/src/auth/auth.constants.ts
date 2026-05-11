// Cookie used to carry the JWT for the web UI. CLI/API-key clients keep
// using the Authorization header — see JwtStrategy for both extractors.
export const AUTH_COOKIE_NAME = "rh_auth";

// 7 days, matching the default JWT TTL.
export const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
