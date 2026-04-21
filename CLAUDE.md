# RulesHub — Claude Code Rules

## Monorepo Structure

```
ruleshub/
├── apps/
│   ├── api/          # NestJS backend — REST API (AGPL-3.0)
│   └── web/          # Next.js 15 frontend — consumes the API only (AGPL-3.0)
├── packages/
│   ├── types/        # Shared TypeScript types + Zod schemas (MIT)
│   └── cli/          # CLI tool — npx ruleshub (MIT)
```

- The web app **never** bypasses the API — all data goes through `apps/api`
- Shared types live in `packages/types` — import from there, never duplicate
- Each app/package has its own `CLAUDE.md` with context-specific rules

---

## Global Rules

- **Never use `any`** — type explicitly or use `unknown`
- **No `console.log`** in application code
- **Always read existing code before writing** — never assume structure; check first
- **Never generate placeholder or TODO code** — if something is unclear, ask
- **Never hardcode environment variables**
- **Commit message format:** `type(scope): short description` — types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`

---

## Available Workflows

- `/new-feature` — scaffold a new NestJS feature module (`apps/api`)
- `/new-page` — scaffold a new Next.js page (`apps/web`)
- `/new-component` — scaffold a new React component (`apps/web`)
- `/new-schema` — add a new type or Zod schema (`packages/types`)
- `/new-cli-command` — add a new CLI command (`packages/cli`)
- `/db-migration` — update Prisma schema and generate a migration
- `/pr-review` — review a diff against all project rules
- `/bug-fix` — reproduce, identify root cause, fix only that
