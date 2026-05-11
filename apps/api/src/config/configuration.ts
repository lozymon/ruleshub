export default () => ({
  port: parseInt(process.env.PORT ?? "3001", 10),
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  apiUrl: process.env.API_URL ?? "http://localhost:3001/v1",
  // GitHub numeric IDs that should be auto-elevated to admin on login.
  // Keyed by githubId (not username) so reusing a deleted username can't
  // re-grant admin privileges.
  adminGithubIds: (process.env.ADMIN_GITHUB_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  database: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackUrl: process.env.GITHUB_CALLBACK_URL,
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: "7d",
    },
  },
  storage: {
    endpoint: process.env.MINIO_ENDPOINT ?? "localhost",
    port: parseInt(process.env.MINIO_PORT ?? "9000", 10),
    useSsl: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY ?? "",
    secretKey: process.env.MINIO_SECRET_KEY ?? "",
    bucket: process.env.MINIO_BUCKET ?? "ruleshub-packages",
  },
});
