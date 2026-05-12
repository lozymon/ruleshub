# syntax=docker/dockerfile:1.7

# Base image pinned by digest. `node:20-alpine` as of audit on 2026-05-11.
# Refresh the digest periodically (e.g. when bumping Node minor versions or
# pulling Alpine security updates).
ARG NODE_IMAGE=node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293

FROM ${NODE_IMAGE} AS base
# Corepack reads the pnpm version from /app/package.json's `packageManager`
# field — single source of truth, no version duplication.
RUN corepack enable
WORKDIR /app

# ─── Install (full, for build) ────────────────────────────────────────────
FROM base AS deps
# Some build platforms (Coolify, etc.) inject NODE_ENV=production at build
# time. The build stage needs devDependencies (tsc, nest-cli, jest types,
# etc.), so we force them in explicitly instead of relying on NODE_ENV.
#
# Only api + types are needed for this image; other workspace members
# (apps/web, packages/cli, etc.) have postinstall scripts that need their
# own source files. pnpm tolerates the missing workspace dirs at install
# time and skips them.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
RUN pnpm install --frozen-lockfile --prod=false --filter @ruleshub/api... --filter @ruleshub/types

# ─── Build ────────────────────────────────────────────────────────────────
FROM deps AS builder
COPY packages/types ./packages/types
COPY apps/api ./apps/api
RUN pnpm --filter @ruleshub/types build \
 && pnpm --filter @ruleshub/api exec prisma generate \
 && pnpm --filter @ruleshub/api build

# ─── Install (prod-only, for runtime) ─────────────────────────────────────
# Separate stage so devDependencies never reach the final image. `prisma`
# itself is a runtime dependency in apps/api/package.json because the
# entrypoint runs `prisma migrate deploy` on container start.
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY apps/api/prisma ./apps/api/prisma
RUN pnpm install --frozen-lockfile --prod --filter @ruleshub/api... --filter @ruleshub/types \
 && pnpm --filter @ruleshub/api exec prisma generate

# ─── Runtime image ────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3001

# openssl: required by Prisma. tini: PID 1 / signal forwarding. wget: HEALTHCHECK.
RUN apk add --no-cache openssl tini wget

# Prod-only node_modules (lean — no jest/ts-jest/nest-cli/etc). prisma
# client is regenerated inside the prod-deps stage so the generated files
# live in the right pnpm-store path for the prod dep graph. We also copy
# packages/types/node_modules so its dependencies (zod) resolve via pnpm's
# per-package symlinks.
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=prod-deps --chown=node:node /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=prod-deps --chown=node:node /app/packages/types/node_modules ./packages/types/node_modules

# Built workspace artifacts
COPY --from=builder --chown=node:node /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=node:node /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder --chown=node:node /app/packages/types/dist ./packages/types/dist

# Workspace manifests (pnpm symlinks expect these alongside node_modules)
COPY --chown=node:node package.json pnpm-workspace.yaml ./
COPY --chown=node:node apps/api/package.json ./apps/api/
COPY --chown=node:node packages/types/package.json ./packages/types/

COPY --chown=node:node apps/api/entrypoint.sh ./apps/api/entrypoint.sh
RUN chmod +x ./apps/api/entrypoint.sh

USER node
WORKDIR /app/apps/api

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-3001}/v1/health" >/dev/null 2>&1 || exit 1

# tini reaps zombies and forwards signals so SIGTERM reaches the entrypoint
# (and any in-flight `prisma migrate deploy`) cleanly.
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["./entrypoint.sh"]
