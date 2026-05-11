// Provides safe defaults for env vars that would otherwise cause module-init failures.
// Override DATABASE_URL in .env.test to point at a real test database.
process.env.DATABASE_URL ??=
  "postgresql://ruleshub:ruleshub@localhost:5432/ruleshub_test";
process.env.JWT_SECRET ??= "test-jwt-secret-not-for-production";
process.env.GITHUB_CLIENT_ID ??= "test-client-id";
process.env.GITHUB_CLIENT_SECRET ??= "test-client-secret";
process.env.GITHUB_CALLBACK_URL ??=
  "http://localhost:3001/v1/auth/github/callback";
process.env.APP_URL ??= "http://localhost:3000";
process.env.DISABLE_THROTTLER ??= "true";
