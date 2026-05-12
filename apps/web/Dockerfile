FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Install dependencies
FROM base AS deps
WORKDIR /app
# Force devDeps in install. Coolify (and other build platforms) inject
# NODE_ENV=production as a build-time env var, which makes pnpm skip
# devDependencies — but the build stage needs `tsc`/`next` which live
# there. The runner stage below resets NODE_ENV=production for runtime.
ENV NODE_ENV=development
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
RUN pnpm install --frozen-lockfile

# Build packages/types first, then the web app
FROM deps AS builder
WORKDIR /app
COPY packages/types ./packages/types
COPY apps/web ./apps/web
RUN pnpm --filter @ruleshub/types build
RUN pnpm --filter web build

# Production image using Next.js standalone output
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/web/server.js"]
