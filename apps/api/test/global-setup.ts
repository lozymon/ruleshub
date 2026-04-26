import { execSync } from "child_process";

export default async function globalSetup() {
  const dbUrl =
    process.env.DATABASE_URL ??
    "postgresql://ruleshub:ruleshub@localhost:5432/ruleshub_test";

  execSync("pnpm prisma migrate deploy", {
    cwd: __dirname + "/..",
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: "inherit",
  });
}
