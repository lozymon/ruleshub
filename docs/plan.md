# RulesHub — Marketplace Plan

A provider-agnostic website where developers can publish, discover, and install
AI coding tool assets — works with Claude Code, Cursor, GitHub Copilot, Windsurf,
Cline, Continue, Aider, and any future tool.

Domain: **ruleshub.dev**
Built API-first so IDE extensions (VS Code, JetBrains, etc.) can integrate later.

**Open Source** — community-driven, publicly auditable, trust-first.

- `apps/api` + `apps/web` → **AGPL-3.0** (forks that run as a service must stay open)
- `packages/types` + `packages/cli` → **MIT** (freely embeddable in any tool or extension)

---

## What Is It?

A package registry and marketplace for AI coding tool assets. Not tied to any
single AI provider — a developer publishes a "NestJS Rules" package once, and it
can target Claude Code, Cursor, and Copilot simultaneously.

### Asset Types

Two tiers — individual assets (installable on their own) and packs that bundle them.

**Individual assets:**

| Type           | Description                                                                     |
| -------------- | ------------------------------------------------------------------------------- |
| **Rule**       | A single instruction file fed to the AI (CLAUDE.md snippet, .cursorrules, etc.) |
| **Command**    | A single custom slash command / skill / prompt                                  |
| **Workflow**   | A single multi-step agent playbook                                              |
| **Agent**      | A single custom agent configuration                                             |
| **MCP Server** | A single MCP server config + install instructions                               |

**Bundles:**

| Type     | Description                                                                     |
| -------- | ------------------------------------------------------------------------------- |
| **Pack** | Curated collection of individual assets for a project type (e.g. "NestJS Pack") |

A pack lists individual assets as dependencies — installing a pack installs each one automatically.
Users can also browse and install any individual asset on its own without needing a pack.

### Supported AI Tools (initial)

| Tool           | Config files targeted                                     |
| -------------- | --------------------------------------------------------- |
| Claude Code    | `CLAUDE.md`, `.claude/commands/`, `.claude/settings.json` |
| Cursor         | `.cursorrules`, `.cursor/rules/`                          |
| GitHub Copilot | `.github/copilot-instructions.md`                         |
| Windsurf       | `.windsurfrules`                                          |
| Cline          | `.clinerules`                                             |
| Aider          | `.aider.conf.yml`, `CONVENTIONS.md`                       |
| Continue       | `.continue/` config                                       |

New tools can be added over time without breaking the manifest format.

---

## Goals

- [ ] Provider-agnostic — one package can target multiple AI tools
- [ ] Website where devs can browse and search assets by tool, type, tag, project type
- [ ] GitHub OAuth — publish under your account
- [ ] Publish packages via web UI (v1) and CLI (v2)
- [ ] Install via download (v1) and `npx ruleshub install <name>` (v2)
- [ ] Project type recommendation engine — detect stack, suggest packs
- [ ] REST API designed from day one to be consumed by IDE extensions
- [ ] Ratings, stars, download counts
- [ ] Fork & remix individual assets with attribution to original
- [ ] Import from GitHub repo — point at a repo with `ruleshub.json`, auto-sync on new tags
- [ ] GitHub Actions integration — `ruleshub/install` action for CI/CD bootstrapping
- [ ] Update checker — `npx ruleshub outdated` scans installed assets for newer versions
- [ ] Organisation accounts — publish under `acmecorp/nestjs-rules` team namespaces
- [ ] Verified publishers — trust badge for official/known maintainers
- [ ] Private packages — paid tier for org-internal assets
- [ ] Collections — community-curated lists of assets ("Best security rules", "Top React packs")
- [ ] Comments & discussions — per-asset comment threads
- [ ] Leaderboard — top contributors, most starred publishers, trending this week
- [ ] Weekly digest email — top new assets and most downloaded sent to subscribers
- [ ] Quality score — auto-calculated per asset (has README, changelog, download count, update frequency)
- [x] Version diff viewer — see what changed between versions before updating
- [ ] Dependency security alerts — notify if a package you depend on is yanked or reported
- [ ] Structured changelogs — per-version release notes
- [ ] Publisher analytics dashboard — download trends, top tools, top countries
- [ ] API keys — publish from CI/CD without browser OAuth (`RULESHUB_TOKEN`)
- [ ] Webhooks for consumers — POST notification when a used package releases a new version
- [ ] README badges — version + download count badge for GitHub READMEs
- [ ] Asset preview — see file contents before installing
- [ ] Conflict detection — warn before overwriting existing project files
- [ ] Semantic search — find assets by meaning, not just keywords
- [ ] Sponsored / featured slots — paid homepage and category placement
- [ ] Pro publisher tier — advanced analytics, priority support, fast-track verification

---

## Tech Stack

### Monorepo

- **pnpm workspaces** — package manager
- **Turborepo** — build orchestration

### `apps/api` — NestJS

- NestJS (REST API)
- Prisma ORM
- PostgreSQL
- GitHub OAuth (via Passport.js)
- MinIO (self-hosted S3-compatible storage via Coolify)
- Swagger/OpenAPI auto-generated docs (critical for IDE integrations)

### `apps/web` — Next.js 15

- Next.js 15 App Router
- Tailwind CSS
- shadcn/ui components
- Consumes the NestJS API only (no logic that bypasses the API)

### `packages/types` — Shared TypeScript types

- `PackageManifest` schema + Zod validation
- API response types shared between web and all future IDE extensions

---

## Manifest Format

Every published asset ships with a `ruleshub.json` at its root.

### Individual asset example (a single rule)

```json
{
  "name": "lozymon/nestjs-rules",
  "version": "1.0.0",
  "type": "rules",
  "description": "NestJS coding rules for AI tools",
  "tags": ["nestjs", "typescript"],
  "projectTypes": ["nestjs", "node"],
  "license": "MIT",
  "targets": {
    "claude-code": { "file": "targets/claude-code/CLAUDE.md" },
    "cursor": { "file": "targets/cursor/.cursorrules" },
    "copilot": { "file": "targets/copilot/copilot-instructions.md" }
  }
}
```

### Individual asset example (a single command)

```json
{
  "name": "lozymon/nestjs-generate-module",
  "version": "1.0.0",
  "type": "command",
  "description": "Slash command to scaffold a NestJS module",
  "tags": ["nestjs", "scaffold"],
  "projectTypes": ["nestjs"],
  "license": "MIT",
  "targets": {
    "claude-code": { "file": "command.md" }
  }
}
```

### Pack example (bundle of individual assets)

```json
{
  "name": "lozymon/nestjs-starter-pack",
  "version": "1.0.0",
  "type": "pack",
  "description": "Complete NestJS + Prisma starter pack",
  "tags": ["nestjs", "typescript", "prisma"],
  "projectTypes": ["nestjs", "node"],
  "license": "MIT",
  "includes": [
    "lozymon/nestjs-rules@^1.0.0",
    "lozymon/nestjs-generate-module@^1.0.0",
    "lozymon/pr-review-workflow@^2.0.0"
  ]
}
```

Valid `type` values: `rule` | `command` | `workflow` | `agent` | `mcp-server` | `pack`

The `targets` map is open-ended — new tools can be added without a manifest version bump.
Packs have no `targets` of their own; they delegate to the individual assets they include.

---

## API Design (v1)

Base URL: `https://api.ruleshub.dev/v1`

### Packages

```
GET    /packages                          # list/search (q, type, tag, projectType, tool, scope=individual|pack)
GET    /packages/:name                    # package detail + all versions
GET    /packages/:name/:version           # specific version metadata
GET    /packages/:name/:version/download  # download package zip
POST   /packages                          # publish new package (auth)
POST   /packages/:name                    # publish new version (auth)
DELETE /packages/:name/:version           # yank a version (auth, own packages only)
```

### Users

```
GET    /users/:username    # public profile + published packages
GET    /users/me           # own profile (auth)
```

### Recommendations

```
GET    /recommendations?projectType=nestjs&tool=claude-code
```

### Auth

```
GET    /auth/github           # redirect to GitHub OAuth
GET    /auth/github/callback  # OAuth callback
POST   /auth/logout
GET    /auth/me
```

### Stars

```
POST   /packages/:name/star
DELETE /packages/:name/star
```

---

## Database Schema (Prisma)

```
User
  id, githubId, username, avatarUrl, bio, verified, createdAt

Organisation
  id, slug, displayName, avatarUrl, verified, createdAt

OrgMember
  orgId, userId, role (owner | admin | member)

Package
  id, namespace (user or org slug), name, type, description
  ownerId, ownerType (user | org)
  forkedFromId (nullable — points to original Package)
  tags[], projectTypes[], supportedTools[]
  isPrivate, totalDownloads, stars, createdAt, updatedAt

PackageVersion
  id, packageId, version, manifestJson, storageKey
  downloads, yanked, publishedAt

Star
  userId, packageId

GitHubImport
  id, packageId, repoUrl, lastSyncedAt, webhookId
```

---

## UI / UX

### Design Direction

Developer-first, dark mode by default. The aesthetic sits between the VS Code marketplace
and npm — functional and content-dense, not flashy. Devs trust tools that look like tools.

- **Dark mode first**, light mode toggle available
- **Monospace font** for all code/rule content previews (Geist Mono or JetBrains Mono)
- **Sans-serif UI font** for everything else (Geist or Inter)
- **Accent colour** — electric indigo/violet — signals AI without belonging to any one provider
- **No heavy animations** — transitions are fast and subtle, content loads instantly
- **Inspiration** — npm registry (package pages), pkg.go.dev (clean), Vercel (dark + modern)

---

### Key Page Layouts

#### Landing (`/`)

- Full-width search bar front and centre — first thing you see
- Tool filter pill tabs below search: `All` `Claude Code` `Cursor` `Copilot` `Windsurf` `Cline` `...`
- Stats bar: "X assets · Y publishers · Z installs"
- Featured packs section (curated or sponsored)
- Trending this week — horizontal scroll card row
- Recently published — card grid
- CTA strip: "Publish your rules in 2 minutes →"

#### Browse (`/browse`)

- Left sidebar (collapsible on mobile):
  - Type filter: All / Rule / Command / Workflow / Agent / MCP Server / Pack
  - Tool filter: checkboxes per supported tool
  - Project type filter: nestjs / react / python / etc.
  - Tag cloud
- Main area: asset card grid
  - Each card: name, author avatar, description, type badge, tool badges, ⭐ stars, ↓ downloads, quality score pill
- Sort bar: Trending · Newest · Most Downloaded · Most Starred
- List / Grid view toggle

#### Package Detail (`/packages/:owner/:name`)

- Header row: name, owner link, version badge, type badge, verified badge, quality score
- Action buttons: `Install` · `⭐ Star` · `Fork` · `Report`
- Install panel (right sidebar / drawer on mobile):
  - Tool selector tabs: Claude Code · Cursor · Copilot · ...
  - Shows exact install command for selected tool
  - File preview accordion — see what will be written before installing
- Main content tabs:
  - `README` — rendered markdown
  - `Files` — file tree with syntax-highlighted preview
  - `Versions` — version history with diff link between any two
  - `Changelog` — structured release notes
  - `Dependencies` — what this asset depends on
  - `Dependents` — what depends on this asset
  - `Discussions` — comment thread
- Forked from banner (if applicable) with link to original

#### User / Org Profile (`/users/:username`)

- GitHub-style header: avatar, username, bio, verified badge, join date
- Stats: X packages · Y stars received · Z total downloads
- Packages tab grid (same cards as browse)
- Stars tab — packages they've starred
- Collections tab — lists they've curated

#### Publish (`/publish`)

- Step-by-step wizard:
  1. Upload zip or connect GitHub repo
  2. Manifest detected / editor to fill in `ruleshub.json`
  3. Preview — shows file tree, readme render, install preview per tool
  4. Confirm & publish
- Drag-and-drop upload zone
- Live manifest validation with inline errors

#### Dashboard (`/dashboard`)

- Packages table: name, version, downloads, stars, quality score, last updated, actions
- Quick publish button
- Notifications panel: new stars, comments, dependency alerts, version update prompts
- Analytics teaser → upgrade to Pro for full charts

---

### Component Patterns

| Component        | Behaviour                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------- |
| Asset card       | Compact, shows type badge + tool chips + stats. Click goes to detail page                   |
| Tool badge       | Coloured pill per tool — each tool has its own colour (e.g. Claude = orange, Cursor = blue) |
| Quality score    | Coloured ring (red → yellow → green) with score 0–100                                       |
| Verified badge   | Filled checkmark, tooltip explains criteria                                                 |
| Install panel    | Sticky on desktop, bottom sheet on mobile                                                   |
| Version diff     | Side-by-side or unified diff, syntax highlighted                                            |
| Conflict warning | Inline warning banner in install panel if a file already exists                             |

---

### Responsive Strategy

- **Desktop** — sidebar + main content two-column layout
- **Tablet** — collapsible sidebar, single column
- **Mobile** — bottom sheet for filters, bottom sheet for install panel, stacked cards

---

### Empty & Loading States

- Skeleton cards on browse load (no layout shift)
- Empty search results: suggest related tags or tools
- New user profile: "Publish your first asset" CTA
- Zero stars / downloads: show freshness date instead of zeroed stats to avoid cold-start stigma

---

## Website Pages

```
/                          # landing — featured packs, search, tool filter tabs
/browse                    # browse all — filter by tool, type, tag, projectType
/packages/:name            # package detail — readme, versions, install instructions per tool
/packages/:name/:version        # specific version detail
/packages/:name/fork            # fork asset into own namespace
/users/:username                # public profile
/orgs/:orgname                  # organisation profile + packages
/publish                        # publish form (auth required)
/import                         # import from GitHub repo URL
/dashboard                      # manage own packages (auth required)
/dashboard/org/:orgname         # org package management
/dashboard/analytics            # publisher analytics (pro)
/login                          # GitHub OAuth entry
/tools                          # directory of supported AI tools
/tools/:tool                    # all packages for a specific tool
/collections                    # browse community collections
/collections/:username/:slug    # single collection
/leaderboard                    # top publishers and assets
/badges/:name                   # README badge endpoint (SVG)
```

---

## Repo Structure

```
ruleshub/
├── apps/
│   ├── api/                    # NestJS
│   │   ├── src/
│   │   │   ├── packages/       # CRUD, publish, download
│   │   │   ├── users/
│   │   │   ├── auth/           # GitHub OAuth
│   │   │   ├── recommendations/
│   │   │   └── storage/        # R2/MinIO abstraction
│   │   └── prisma/
│   │       └── schema.prisma
│   └── web/                    # Next.js 15
│       └── src/
│           ├── app/
│           └── components/
├── packages/
│   └── types/                  # shared PackageManifest + API types
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Build Phases

### Phase 0 — Claude Code Rules & Workflows

Set up the CLAUDE.md rules and skill workflows that govern how Claude Code assists
throughout the entire project. Done before writing a single line of application code.
This is also the first real content we can publish to RulesHub when it launches.

#### `CLAUDE.md` — Global project rules

- [x] Monorepo awareness — which app is backend, which is frontend, where shared types live
- [x] Never use `any` — always type explicitly or use `unknown`
- [x] No `console.log` in application code — use NestJS Logger on the backend
- [x] Always read existing code before writing new code — no assumptions about structure
- [x] Never generate placeholder/TODO code — if something is unclear, ask
- [x] Commit message format convention
- [x] Environment variables — never hardcode, always reference from config service

#### Per-app CLAUDE.md rules

- [x] `apps/api/CLAUDE.md` — NestJS/Prisma rules
- [x] `apps/web/CLAUDE.md` — Next.js 15 App Router rules
- [x] `packages/types/CLAUDE.md` — Zod-first schema rules
- [x] `packages/cli/CLAUDE.md` — CLI rules (dry-run, conflict detection, commander)

#### Backend rules (NestJS + Prisma)

- [x] **Module structure** — every feature gets its own module: `controller`, `service`, `module`, `dto/`, `entities/` — no exceptions
- [x] **Controllers are thin** — no business logic, only call service methods and return DTOs
- [x] **Always use DTOs** with `class-validator` decorators for all request bodies
- [x] **Always add Swagger decorators** (`@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`) to every endpoint
- [x] **Prisma** — always use the injected `PrismaService`, never instantiate directly; wrap multi-step operations in `$transaction`
- [x] **Error handling** — throw NestJS built-in exceptions (`NotFoundException`, `ForbiddenException`, etc.), never raw `throw new Error()`
- [x] **Auth guards** — every protected route must have `@UseGuards(JwtAuthGuard)` explicitly, never rely on global defaults
- [x] **No raw SQL** — use Prisma query API only; if a raw query is truly needed, document why
- [x] **Response format** — all list endpoints return `{ data: T[], total: number, page: number, limit: number }`

#### Frontend rules (Next.js 15 App Router)

- [x] **Server Components by default** — only add `'use client'` when you need interactivity or browser APIs; document why
- [x] **Data fetching in Server Components** — never fetch data inside Client Components unless it's a user-triggered action
- [x] **No `useEffect` for data fetching** — use Server Components or React Query for client-side data
- [x] **shadcn/ui first** — always check if a shadcn component exists before building a custom one
- [x] **Tailwind only** — no inline styles, no CSS modules, no styled-components
- [x] **Form pattern** — always use `react-hook-form` + `zod` resolver; never uncontrolled forms
- [x] **Loading states** — every async page/component must have a `loading.tsx` or `Suspense` boundary
- [x] **Error states** — every route segment must have an `error.tsx` boundary
- [x] **No magic strings** — all route paths defined as constants in `lib/routes.ts`
- [x] **API calls** — always go through a typed client in `lib/api/` — never call `fetch` directly in components

#### Workflows (skills)

- [x] **`/new-feature`** — checklist: read existing module → plan DTOs → plan service methods → plan controller → implement in order → write tests
- [x] **`/new-page`** — checklist: is data needed server or client side? → scaffold server component → add loading.tsx → add error.tsx → add to routes.ts
- [x] **`/new-component`** — checklist: shadcn first → server vs client → props type → loading/empty states
- [x] **`/new-schema`** — checklist: Zod schema first → infer type → export → unit tests
- [x] **`/new-cli-command`** — checklist: dry-run + force + json flags → shared writer/api client → unit tests
- [x] **`/db-migration`** — checklist: update Prisma schema → generate migration → review SQL before applying → update seed if needed
- [x] **`/pr-review`** — review diff for: missing DTOs, missing Swagger decorators, `any` usage, missing guards, direct fetch in components, missing error boundaries
- [x] **`/bug-fix`** — checklist: reproduce → identify root cause → fix only the root cause → do not refactor surrounding code

---

### Phase 0.5 — Project Setup

Everything that must exist before writing application code.

#### GitHub

- [x] Create GitHub repository `ruleshub` (monorepo, public)
- [x] Add `LICENSE` files — AGPL-3.0 at root, MIT in `packages/types` and `packages/cli`
- [x] Add `CONTRIBUTING.md` — how to add new tool targets, PR guidelines
- [x] Register GitHub OAuth App — get `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET`
  - Homepage URL: `https://ruleshub.dev`
  - Callback URL: `https://api.ruleshub.dev/v1/auth/github/callback`
  - Also register a second OAuth App for local dev with `http://localhost:3001/v1/auth/github/callback`
- [x] Set up branch protection: `main` requires PR + passing CI, no direct push

#### Branching Strategy

- `main` — production, auto-deploys to Coolify on merge
- `develop` — staging, auto-deploys to staging environment on merge
- `feature/*` — feature branches, PR into `develop`
- `fix/*` — bug fix branches, PR into `develop`
- Hotfixes go directly from `main` → PR → `main`

#### Domain & DNS

- [x] Point `ruleshub.dev` → VPS IP (web)
- [x] Point `api.ruleshub.dev` → VPS IP (API)
- [x] Configure both in Coolify with automatic SSL (Let's Encrypt)

#### Local Dev Environment

- [x] `docker-compose.yml` at repo root with:
  - PostgreSQL 16
  - MinIO (S3-compatible storage)
  - Adminer (DB GUI, dev only)
  - MinIO Console (storage GUI, dev only)
- [x] `docker compose up` starts everything — zero manual setup

```yaml
# docker-compose.yml (dev only)
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: ruleshub
      POSTGRES_PASSWORD: ruleshub
      POSTGRES_DB: ruleshub
    ports: ['5432:5432']

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ruleshub
      MINIO_ROOT_PASSWORD: ruleshub_secret
    ports: ['9000:9000', '9001:9001']

  adminer:
    image: adminer
    ports: ['8080:8080']
```

#### Environment Variables

- [x] `.env.example` committed to repo with all keys (no values)
- [x] `.env` in `.gitignore`

```env
# App
APP_URL=http://localhost:3000
API_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://ruleshub:ruleshub@localhost:5432/ruleshub

# Auth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3001/v1/auth/github/callback
JWT_SECRET=

# Storage (MinIO)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=ruleshub
MINIO_SECRET_KEY=ruleshub_secret
MINIO_BUCKET=ruleshub-packages
```

#### CI/CD Pipeline (GitHub Actions)

- [x] `ci.yml` — runs on every PR: lint, typecheck, tests
- [x] `deploy-staging.yml` — runs on merge to `develop`: triggers Coolify staging deploy
- [x] `deploy-prod.yml` — runs on merge to `main`: triggers Coolify production deploy
- [x] Coolify deploy webhooks configured for both environments

#### Testing Strategy

- [ ] **API (NestJS)** — e2e tests with Supertest against a real test database (not mocks)
- [ ] **Frontend (Next.js)** — component tests with Vitest + Testing Library
- [ ] **Shared types** — unit tests for all Zod schema validations
- [ ] Test database spun up in CI via `docker-compose` service
- [ ] Coverage thresholds: 80% on API business logic, no threshold on UI (test behaviour not markup)

---

### Phase 1 — Foundation

- [x] Monorepo scaffold (pnpm + Turborepo)
- [x] Shared `types` package — `PackageManifest` schema + Zod validation + supported tools enum
- [x] NestJS API skeleton with Swagger/OpenAPI
- [x] Prisma schema + migrations
- [x] GitHub OAuth (Passport.js)
- [x] File storage abstraction (local dev → R2 in prod)
- [x] Next.js 15 scaffold with Tailwind + shadcn/ui
- [x] Design system overhaul — dark-first, Geist fonts, custom design tokens, navbar, footer

### Phase 2 — Core Features

- [x] Publish endpoint + web UI form (3-step wizard: manifest → upload → dry-run preview)
- [x] Browse/search page — filter by tool, type, tag, projectType
- [x] Package detail page — InstallBlock, StarButton, README/versions/sidebar layout
- [x] Download endpoint
- [x] Dashboard page — stat cards, packages table, chart placeholder
- [x] User profile page (`/users/[username]`) — stub exists, needs design overhaul

#### Pack system (dependency infrastructure)

- [x] `PackageDependency` DB table — join table linking packs to their included assets with version ranges
- [x] Publish resolves `includes` → `PackageDependency` rows; fail the transaction if any referenced package does not exist
- [x] `PackageSummaryDto` type + `includes: PackageSummaryDto[]` on `PackageDto` — resolved dep metadata returned on every pack
- [x] Browse card — show pack contents summary ("2 rules · 1 command · 1 workflow") instead of bare `pack` type badge
- [x] Package detail — "Contents" tab listing each included asset as a linked mini-card (type icon, name, description, version)
- [x] Samples split — `nestjs-rules` (rule) · `nestjs-generate-module` (command) · `nestjs-pr-review-workflow` (workflow) · `nestjs-starter-pack` (pack referencing all three)

### Phase 3 — Discovery & Community

- [x] Stars and ratings
- [x] Recommendations endpoint (`projectType` + `tool`)
- [x] Featured / trending on homepage
- [x] `/tools/:tool` pages — stub exists, needs design overhaul
- [x] Fork & remix — fork asset into own namespace with attribution
- [x] Collections — create and share curated asset lists
- [x] Comments & discussions per asset
- [x] Leaderboard page (`/leaderboard`) — stub exists, needs design overhaul
- [ ] Weekly digest email signup + sending

### Phase 4 — CLI

- [x] `npx ruleshub install <name> --tool claude-code` — installs into correct paths
- [x] `npx ruleshub publish` — packages and publishes
- [x] `npx ruleshub outdated` — check installed assets for newer versions
- [x] `npx ruleshub update` — update outdated assets
- [x] Conflict detection — warn before overwriting existing files
- [x] Asset preview — show file contents before writing (`--dry-run`)
- [x] Pack-aware install — detect `type: pack`, resolve and install each included asset individually; print "Installing N packages from …"

### Phase 5 — Organisations & Trust

- [x] Organisation accounts — team namespaces (`acmecorp/nestjs-rules`)
- [x] Org dashboard — manage members and packages
- [x] Verified publisher badges — `ADMIN_USERNAMES` env var gates `PATCH /admin/users/:username/verify` and `PATCH /admin/orgs/:slug/verify`
- [x] Admin dashboard (`/dashboard/admin`) — paginated user table with search, toggle verified + blocked; visible only to `ADMIN_USERNAMES`; `isAdmin` flag on `/auth/me` response
- [x] User blocking — `blocked` flag on User prevents login and publishing; admin can set via dashboard
- [x] Quality score — auto-calculated per asset, shown on browse and detail pages
- [x] Version diff viewer — side-by-side diff between versions
- [x] Structured changelogs — per-version release notes field
- [ ] Dependency security alerts — notify dependents when a package is yanked or reported
- [x] API keys — `RULESHUB_TOKEN` for CI/CD publishing without browser OAuth
- [x] Webhooks for consumers — subscribe to new version notifications
- [x] README badges — auto-generated version + downloads badge per asset

### Stub Pages Needing Design

- [x] `/users/[username]` — public profile page
- [x] `/tools/[tool]` — per-tool package listing
- [x] `/leaderboard` — top publishers and trending assets

### Auth State (Browser)

- [x] Session token storage after GitHub OAuth callback
- [x] Auth-aware navbar (show avatar + logout when signed in)
- [x] Protected route redirects (`/dashboard`, `/publish`)

### Phase 6 — GitHub Integration

- [x] Import from GitHub repo — detect `ruleshub.json`, auto-publish on new tags via webhook
- [ ] `ruleshub/install` GitHub Action — install assets in CI/CD pipelines

### Phase 7 — Monetisation

- [ ] Private packages — org-only visibility (paid tier)
- [ ] Sponsored / featured slots — paid homepage and category placement
- [ ] Pro publisher tier — advanced analytics, priority support, fast-track verification
- [ ] Publisher analytics dashboard — download trends, top install tools, top countries

### Phase 8 — Search & Intelligence

- [ ] Semantic search — find assets by meaning, not just keywords
- [ ] Improved recommendations — collaborative filtering (users who installed X also installed Y)

### Phase 9 — IDE Extensions

- [ ] Marketplace sidebar in vscode-cc-admin (Claude Code admin extension)
- [ ] Generic VS Code marketplace extension for other tools
- [ ] Project type auto-detection → recommended packs prompt

---

### Phase 10 — Documentation

Comprehensive Markdown-based documentation that lives in the repo and is served as a
first-class docs site. Every page is a `.md` or `.mdx` file — community can contribute
via PR, same as the code.

#### Structure (`docs/`)

```
docs/
├── getting-started/
│   ├── introduction.md          # what RulesHub is and why it exists
│   ├── quick-start.md           # install your first package in 60 seconds
│   └── concepts.md              # rules · commands · workflows · agents · packs
├── publishing/
│   ├── your-first-package.md    # step-by-step: create → validate → publish
│   ├── manifest-reference.md    # full ruleshub.json field reference
│   ├── targets.md               # how to write files for each supported AI tool
│   ├── packs.md                 # how to bundle assets into a pack
│   ├── versioning.md            # semver conventions, yanking, changelogs
│   └── github-import.md         # auto-publish from a GitHub repo on new tags
├── cli/
│   ├── overview.md              # CLI install and global flags
│   ├── install.md               # `ruleshub install` — all flags and examples
│   ├── publish.md               # `ruleshub publish` — auth, dry-run, tokens
│   ├── outdated.md              # `ruleshub outdated` and `update`
│   └── validate.md              # `ruleshub validate` — local manifest linting
├── api/
│   ├── overview.md              # base URL, auth, versioning, rate limits
│   ├── packages.md              # /packages endpoints
│   ├── users.md                 # /users endpoints
│   ├── auth.md                  # OAuth + API key flow
│   └── recommendations.md       # /recommendations endpoint
├── tools/
│   ├── claude-code.md           # target paths, install behaviour, CLAUDE.md rules
│   ├── cursor.md
│   ├── copilot.md
│   ├── windsurf.md
│   ├── cline.md
│   ├── aider.md
│   └── continue.md
├── contributing/
│   ├── adding-a-tool.md         # PR checklist for adding a new AI tool target
│   ├── development.md           # local dev setup (docker compose, env vars)
│   └── architecture.md          # monorepo layout, data flow, storage abstraction
└── changelog.md                 # project-level changelog (not per-package)
```

#### Docs Site

- [ ] Add a `/docs` section inside `apps/web` using Next.js MDX (`@next/mdx`)
- [ ] Sidebar navigation auto-generated from the `docs/` folder structure
- [ ] Full-text search powered by [Pagefind](https://pagefind.app) (static, zero infra cost)
- [ ] Syntax-highlighted code blocks (Shiki, matches the existing site theme)
- [ ] "Edit this page on GitHub" link on every page
- [ ] Version badge in the header linking to latest CLI release on npm
- [ ] SEO: `sitemap.xml` includes all `/docs/*` routes
- [ ] Dark mode consistent with the rest of the site (no separate theme toggle needed)
- [ ] Mobile-friendly: collapsible sidebar, sticky ToC on desktop

#### Content Milestones

- [ ] Getting Started + Concepts section — unblocks new users immediately
- [ ] Manifest Reference — single authoritative source (replaces inline plan docs)
- [ ] CLI Reference — one page per command, with flags table and examples
- [ ] Tool Target Guides — one page per supported AI tool
- [ ] API Reference — human-readable complement to Swagger/OpenAPI
- [ ] Contributing Guide — onboards external contributors

---

### Phase 11 — Package Authoring SDK

Tools that make it easy for anyone to create, validate, and publish RulesHub packages —
without reading the full docs first.

#### `packages/create-ruleshub` — Scaffolding CLI

A zero-config project generator: `npx create-ruleshub`

- [ ] Interactive wizard: name → type → target tools → license → author
- [ ] Generates a ready-to-publish folder with `ruleshub.json`, placeholder files per target, and a `README.md`
- [ ] Templates for every asset type: `rule` · `command` · `workflow` · `agent` · `mcp-server` · `pack`
- [ ] `--template <type>` flag for non-interactive use (CI/scripts)
- [ ] Infers namespace from `git config user.name` / GitHub username
- [ ] Prints next steps: `cd my-package && npx ruleshub validate && npx ruleshub publish`

#### `ruleshub validate` CLI command (extends `packages/cli`)

- [ ] `npx ruleshub validate` — validates `ruleshub.json` in the current directory
- [ ] Checks: required fields, valid semver version, known `type`, known `targets` keys, referenced files exist, valid SPDX license identifier
- [ ] Machine-readable output: `--json` flag returns structured errors for editor integrations
- [ ] Exit code 1 on any error (CI-friendly)
- [ ] Integrated into `npx ruleshub publish` as a pre-publish gate — publish fails if validate fails

#### JSON Schema for `ruleshub.json`

- [ ] Publish `ruleshub-schema` to [SchemaStore](https://www.schemastore.org/json/) — enables IDE autocompletion for any editor (VS Code, IntelliJ, Neovim + LSP)
- [ ] Schema hosted at `https://ruleshub.dev/schema/ruleshub.json` (stable URL)
- [ ] Add `"$schema": "https://ruleshub.dev/schema/ruleshub.json"` to all sample manifests
- [ ] Schema served from `apps/api` and versioned (breaking changes bump schema URL)

#### `packages/ruleshub-kit` — TypeScript authoring helpers

A lightweight utility library for programmatic manifest construction and validation —
useful for tools, scripts, and IDE extensions that need to read or write `ruleshub.json`.

- [ ] `parseManifest(json)` — parses and validates, returns typed `PackageManifest` or throws `ZodError`
- [ ] `buildManifest(partial)` — typed builder with sensible defaults; returns a `PackageManifest`
- [ ] `validateManifest(manifest)` — pure validation, returns `{ valid, errors }`
- [ ] `getTargetFile(manifest, tool)` — resolves the file path for a given AI tool target
- [ ] Re-exports the Zod schema and all types from `packages/types` — single import for consumers
- [ ] MIT licensed (same as `packages/types` and `packages/cli`)
- [ ] Fully tree-shakeable, zero runtime dependencies beyond `zod`

---

## IDE Extension API Contract

Extensions only need:

- `GET /v1/packages?tool=<tool>` — browse filtered to their tool
- `GET /v1/packages/:name/:version/download` — download URL
- `GET /v1/recommendations?projectType=X&tool=Y` — project-aware suggestions
- `GET /v1/auth/me` + OAuth (for publishing from editor, v2)

Keep these stable and versioned from day one.

---

## Open Questions

- [x] Product name — **RulesHub**
- [x] Domain name — **ruleshub.dev** (owned)
- [x] Hosting — **self-hosted VPS on Hostinger via Coolify**
  - Web (Next.js) → Coolify app
  - API (NestJS) → Coolify app
  - PostgreSQL → Coolify managed database
  - MinIO → Coolify service (self-hosted S3-compatible storage, replaces R2)
  - All services in Docker containers managed by Coolify
- [x] File size limit — **5MB per package version**
- [x] Moderation — **reactive for v1** (report button + admin review, automated scanning in v2)
- [x] Namespace — **`username/package-name`** (GitHub-style slash, e.g. `lozymon/nestjs-rules`)
- [x] Tool support — **PR-based** (new tools added via GitHub PR to keep quality high)
