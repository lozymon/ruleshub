import { ConfigService } from "@nestjs/config";

// Cookie used to carry the JWT for the web UI. CLI/API-key clients keep
// using the Authorization header — see JwtStrategy for both extractors.
export const AUTH_COOKIE_NAME = "rh_auth";

// 7 days, matching the default JWT TTL.
export const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Minimum length we'll accept for JWT_SECRET. 32 bytes is the smallest
// reasonable HS256 key length per RFC 7518 §3.2.
const MIN_JWT_SECRET_LENGTH = 32;

// Fail-closed: a missing or weak JWT secret is a silent auth bypass
// (an empty/default secret means anyone can mint valid tokens). Throwing
// at module construction makes the misconfig surface during boot instead
// of in production traffic.
export function requireJwtSecret(config: ConfigService): string {
  const secret = config.get<string>("auth.jwt.secret");
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not set. Generate one with `openssl rand -hex 32`.",
    );
  }
  if (secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET is too short (${secret.length} chars). Minimum is ${MIN_JWT_SECRET_LENGTH}.`,
    );
  }
  return secret;
}
