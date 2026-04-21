# Contributing to RulesHub

## Branching

| Branch | Purpose |
|--------|---------|
| `main` | Production — auto-deploys on merge |
| `develop` | Staging — auto-deploys on merge |
| `feature/*` | New features — PR into `develop` |
| `fix/*` | Bug fixes — PR into `develop` |

Hotfixes go directly: `hotfix/*` → PR → `main`.

## Pull Requests

- All PRs require at least one review before merging
- CI must pass (lint, typecheck, tests)
- Use the `/pr-review` workflow to self-review before requesting a review
- Keep PRs focused — one feature or fix per PR
- Commit messages follow `type(scope): short description`
  - Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`

## Adding a New AI Tool Target

RulesHub is provider-agnostic. To add support for a new AI tool:

1. Add the tool to the `SupportedTool` enum in `packages/types/src/tools.ts`
2. Add the default install path(s) for that tool
3. Update the CLI's file writer (`packages/cli/src/lib/writer.ts`) to handle the new target paths
4. Add the tool to the supported tools list in the API (`apps/api/src/packages/`)
5. Add a tool badge colour in the web UI (`apps/web/components/ui/tool-badge.tsx`)
6. Update `CLAUDE.md` in the root with the new tool's config files
7. Open a PR with the title `feat(tools): add <tool-name> support`

New tools are reviewed for quality before merging — include a link to the tool's official documentation.

## Running Locally

```bash
# Start infrastructure
docker compose up -d

# Install dependencies
pnpm install

# Copy and fill env
cp .env.example .env

# Start all apps
pnpm dev
```

## Code Style

See `CLAUDE.md` (root and per-app) for all coding rules. The short version:
- No `any`, no hardcoded env vars, no placeholder code
- Backend: NestJS modules, DTOs, Swagger decorators on every endpoint
- Frontend: Server Components by default, Tailwind only, shadcn/ui first
