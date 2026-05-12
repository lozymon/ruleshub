FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Install dependencies
FROM base AS deps
WORKDIR /app
# Force devDeps in install. Coolify (and other build platforms) inject
# NODE_ENV=production as a build-time env var, which makes pnpm skip
# devDependencies — but the build stage needs `tsc`/`prisma` which live
# there. The runner stage below resets NODE_ENV=production for runtime.
ENV NODE_ENV=development
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
RUN pnpm install --frozen-lockfile

# Build packages/types first, then the API
FROM deps AS builder
WORKDIR /app
COPY packages/types ./packages/types
COPY apps/api ./apps/api
RUN pnpm --filter @ruleshub/types build
RUN pnpm --filter @ruleshub/api exec prisma generate
RUN pnpm --filter @ruleshub/api build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/packages/types ./packages/types
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY apps/api/entrypoint.sh ./apps/api/entrypoint.sh
RUN chmod +x ./apps/api/entrypoint.sh

WORKDIR /app/apps/api
EXPOSE 3001
CMD ["sh", "entrypoint.sh"]
