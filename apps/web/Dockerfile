# syntax=docker/dockerfile:1.7

# Base image pinned by digest. `node:20-alpine` as of audit on 2026-05-11.
# Refresh periodically when bumping Node minors or pulling Alpine updates.
ARG NODE_IMAGE=node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293

FROM ${NODE_IMAGE} AS base
# Corepack picks up the pnpm version from /app/package.json's
# `packageManager` field — single source of truth, no duplication.
RUN corepack enable
WORKDIR /app

# ─── Install (full, for build) ────────────────────────────────────────────
FROM base AS deps
# Some build platforms (Coolify, etc.) inject NODE_ENV=production at build
# time. The build stage needs devDependencies (typescript, next eslint
# config, tailwind, pagefind, etc.), so we force them in explicitly
# instead of relying on NODE_ENV. Only web + types are pulled — pnpm
# tolerates the missing workspace dirs and skips them.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
RUN pnpm install --frozen-lockfile --prod=false --filter web... --filter @ruleshub/types

# ─── Build ────────────────────────────────────────────────────────────────
FROM deps AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY packages/types ./packages/types
COPY apps/web ./apps/web
RUN pnpm --filter @ruleshub/types build \
 && pnpm --filter web build

# ─── Runtime image ────────────────────────────────────────────────────────
# No prod-deps stage needed: Next.js `output: "standalone"` produces a
# self-contained directory with only the runtime files traced from the
# build (server.js + bundled deps). We just copy that.
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# tini: PID 1 / signal forwarding. wget: HEALTHCHECK.
RUN apk add --no-cache tini wget

COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=node:node /app/apps/web/public ./apps/web/public

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-3000}/api/health" >/dev/null 2>&1 || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/web/server.js"]
