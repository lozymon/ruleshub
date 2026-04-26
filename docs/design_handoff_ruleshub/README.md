# Handoff: RulesHub — AI Coding Tool Asset Registry

## Overview
RulesHub is a package registry (npm-style) for AI coding tool configuration assets — rules, slash commands, workflows, agents, MCP servers, packs, and skills — targeting Claude Code, Cursor, Copilot, Windsurf, Cline, Aider, and Continue. Users browse, install, publish, star, and review packages. The design covers 10 pages: Home, Browse, Package Detail, Profile, Tool, Leaderboard, Dashboard, Publish (3-step), Docs, and a 404-equivalent.

## About the Design Files
The files in `design-reference/` are **HTML/CSS/JSX prototypes built for visual fidelity** — not production code. They use inline-Babel-compiled React in the browser, scoped global state, and JSX scripts loaded one-by-one. **Your task is to recreate these designs in the target codebase** using its established framework, routing, styling system, and component library. If no codebase exists, Next.js (App Router) + Tailwind + shadcn/ui is a strong fit since it's the natural target audience for this product.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, sharp corners, dark/light themes, hover/active/focus states, animations, and copy are all decided. Recreate pixel-close.

## Stack Suggestion
- **Framework:** Next.js 15 App Router (or Remix). Server-render lists; CSR is fine for the prototype's interactions.
- **Styling:** Tailwind v4 with CSS variables. Port `:root` / `[data-theme="light"]` / `[data-variant]` blocks from `styles.css` as Tailwind tokens.
- **Components:** shadcn/ui for primitives (Button, Tabs, Dialog, DropdownMenu, Tooltip, Select, Input).
- **Icons:** lucide-react (the prototype's `<Icon>` component is lucide-shaped — paths are similar but original).
- **State:** URL params for routing (replace the localStorage-backed `useRouter` in `app.jsx`); React Query/SWR for data; `next-themes` for theme.
- **Fonts:** Geist + Geist Mono (already used; load via `next/font`).

## Design Tokens (from styles.css)

### Dark theme (default) — VS Code-style neutral greys
| Token | Value |
|---|---|
| `--bg` | `#181818` |
| `--bg-elev` | `#1e1e1e` |
| `--bg-elev-2` | `#252526` |
| `--bg-code` | `#1a1a1a` |
| `--border` | `#2d2d2d` |
| `--border-strong` | `#3c3c3c` |
| `--border-hover` | `#4a4a4a` |
| `--fg` | `#ededf0` |
| `--fg-muted` | `#a1a1aa` |
| `--fg-dim` | `#71717a` |
| `--fg-faint` | `#52525b` |
| `--accent` | `#3b82f6` (blue) |
| `--accent-hover` | `#60a5fa` |
| `--accent-tint` | `rgba(59,130,246,0.12)` |
| `--success` | `#10b981` |
| `--danger` | `#ef4444` |
| `--warn` | `#f59e0b` |
| `--star` | `#f5c518` |

### Light theme overrides
See `[data-theme="light"]` in `styles.css` (key: `--bg: #fafafa`, `--fg: #0a0a0b`, `--accent: #2563eb`).

### Tool brand colors
- Claude Code `#d97757`, Cursor `#4a9eff`, Copilot `#3fb950`, Windsurf `#22d3ee`, Cline `#a78bfa`, Aider `#eab308`, Continue `#8b8cf8`

### Typography
- Sans: **Geist** (300, 400, 500, 600, 700)
- Mono: **Geist Mono** (400, 500, 600)
- Body: 14px / 1.5
- Hero h1: 56px / 1.05 / -0.035em
- Section title: 20px / 600 / -0.015em
- Page title: 26–28px / 600 / -0.02em

### Shape — IMPORTANT
Default variant is `shape-sharp` (added as a class on `<html>`): all cards, buttons, badges, and panels use **2px border-radius**. Rounded variant (6–10px) is selectable via the Tweaks panel. Recreate sharp by default.

### Layout
- Container max-width: **1240px**
- Side padding: 24px
- Navbar height: 56px sticky, blurred bg
- Cards grid: `repeat(3, 1fr)` desktop, 2 tablet, 1 mobile, 16px gap

## Pages

### 1. Home (`HomePage` — pages-home-browse.jsx)
- **Hero**: Pulsing-dot kicker pill, h1 with accent word, sub copy, three CTAs (Browse / Publish / inline `npx ruleshub install …` block). Background: radial gradient over a 48×48 grid mask.
- **Stats bar**: 4 columns separated by vertical rules — **Assets published** (live `PACKAGES.length`), **Monthly installs** (`—` placeholder), **Publishers** (`—` placeholder), **Tools supported** (live `TOOLS.length` + "+ more coming" caption). Stats are constrained to the 1240px container; the divider line below is full-width.
- **Tool tabs**: Horizontal scroll tabs ("All" + 7 tools, each with colored 8px dot + count badge). Tabs are container-constrained but the underline is full-width (wrapped in `.tool-tabs-bar`). Copilot is labelled "GitHub Copilot".
- **Trending this week**: 6 cards.
- **Recently published**: 6 cards.
- **Supported tools grid**: Auto-fit cards, each linking to `/tool/{id}`.

### 2. Browse (`BrowsePage`)
- Big search input (44px), 12,847 placeholder count.
- Tool tabs above the split.
- Two-column: 240px left filter rail (Asset type, Sort, Community filters) + cards grid.
- 9 per page, paginated number buttons.
- Empty state: dashed-border card with icon, heading, "Clear filters" CTA.

### 3. Package Detail (`PackageDetailPage` — pages-package.jsx)
- Breadcrumb (browse › ns › name).
- Header: 56px square type icon, monospace title with `ns/name`, verified check, type pill, description, author chip + version + updated + downloads + tool badges, then right-aligned StarButton + Download + version dropdown.
- **Install block**: Black-ish code panel, top tabs (npx / pnpm / bun / --tool), `$ ` prompt, syntax-tinted command, copy button (turns green on copy).
- 2-col body: 1fr article + 280px sidebar.
- Tabs: README, Versions (table with LATEST pill), Files (file tree + monospace viewer), Comments (threaded with avatars).
- Sidebar cards: install trend sparkline (30d), Repository links, License, Included in packs.

### 4. Profile (`ProfilePage`)
- 96px gradient avatar (deterministic hue from handle), name + verified, @handle, bio, meta row (location, github, stars, installs).
- Tabs: Packages / Starred / Activity.

### 5. Tool (`ToolPage`)
- Hero with 72px square logo (tool color), name, count, type breakdown row.
- Type filter pills, then cards grid.

### 6. Leaderboard (`LeaderboardPage`)
- 3 columns: Top Publishers, Trending This Week, Most Starred. Each row: rank (#1/#2/#3 colored gold/silver/bronze), avatar/icon, name, secondary stat.

### 7. Dashboard (`DashboardPage`)
- Header: "Welcome back, @handle" + Publish CTA.
- 4 stat cards (downloads, stars, packages, weekly installs).
- 2-col chart row: 30-day sparkline + top packages list.
- "My packages" data table with row actions (edit/view/delete).

### 8. Publish (`PublishPage`)
3-step wizard with progress bar:
1. **Manifest**: namespace, name, version, type, description, tool target rows (checkbox + tool dot + name + path field).
2. **Upload**: zip drop-zone OR GitHub URL. Drop-zone shows accepted state with file size + count.
3. **Preview**: validation list (✓/✗ rows, monospace), dry-run "files to write" terminal panel showing `+ [Tool] path  size`. Final "Publish package" button.

### 9. Docs (`DocsPage` — pages-docs.jsx)
- Constrained to **same 1240px container as Browse** (recently changed).
- 3-column layout: 240px left nav (with docs-scoped search) + flexible article + 220px right "On this page" rail with scroll-spy.
- Breadcrumb + Edit on GitHub + last-updated row above title.
- Code blocks with filename header + copy.
- Callouts: Note / Tip / Warning, color-coded left rule + icon.
- Prev/Next nav at bottom.

### 10. Navbar
- Sticky, 56px, `backdrop-filter: blur(12px)`, semitransparent bg.
- Logo (R square + "ruleshub" mono), nav links, search input (320px wide, ⌘K hint kbd), theme toggle, GitHub icon, sign-in or user dropdown.

## Components to Build

| Component | Source | Notes |
|---|---|---|
| `<PackageCard>` | components.jsx | Cards grid item. Hover lifts 1px + glow. |
| `<ToolBadge>` | components.jsx | Inline tool chip (color dot + short name). |
| `<Verified>` | components.jsx | Blue check disc. |
| `<Avatar>` | components.jsx | Gradient circle, hue derived from handle. |
| `<StarButton>` | pages-package.jsx | Toggles starred state, "burst" animation, count flips. |
| `<InstallBlock>` | pages-package.jsx | Tabbed code block with copy. |
| `<Sparkline>` | components.jsx | Pure SVG, fill + line, 260×72 default. |
| `<ToolTabs>` | components.jsx | Horizontal scroll tabs with counts. |
| `<TweaksPanel>` | tweaks.jsx | Floating dev panel — drop in production. |

## Interactions

- **Theme toggle** — persists to `ruleshub:theme`, sets `data-theme` on `<html>`.
- **Sharp/rounded toggle** — sets/removes `shape-sharp` class on `<html>`. Default = sharp.
- **Star button** — animated burst (0.5s scale + rotate), border + fill flip to gold.
- **Copy install** — `navigator.clipboard`, button label flips to "Copied" + green for 1.5s.
- **Tabs** — controlled by `useState`, no router param needed for sub-tabs.
- **Browse filters** — debounce optional; current is immediate. Results memoized.
- **Search** — homepage and browse both filter by `(name + ns + desc).toLowerCase().includes(query)`.
- **Publish wizard** — gate Continue button on validation; final step shows file dry-run.

## State Management
For real implementation:
- Page → URL (`/`, `/browse`, `/p/{ns}/{name}`, `/u/{handle}`, `/tool/{id}`, `/leaderboard`, `/dashboard`, `/publish`, `/docs/{slug}`).
- Filters → search params (`?tool=cursor&type=rule&sort=trending`).
- Theme + variant + accent → cookies for SSR.
- Auth → GitHub OAuth.
- Star action → optimistic update + POST to `/api/packages/{ns}/{name}/star`.

## Sample Content
The prototype seeds 18+ realistic packages (vercel/nextjs-app-router, microsoft/typescript-strict, anthropic/claude-test-runner, etc.) in `data.jsx`. Replace with real DB data — schema is `{ ns, name, type, tools[], desc, stars, downloads, version, verified, trending?, updated }`.

## Files in this bundle
```
design-reference/
  ruleshub.html              ← entry; loads all .jsx files in order
  styles.css                 ← all design tokens + components
  app.jsx                    ← router, theme, layout shell
  data.jsx                   ← icons, mock packages/users, helpers
  components.jsx             ← Navbar, PackageCard, Footer, Sparkline, etc.
  pages-home-browse.jsx
  pages-package.jsx
  pages-profile-tool-lb.jsx
  pages-dashboard-publish.jsx
  pages-docs.jsx
  tweaks.jsx                 ← in-prototype design knobs (skip for prod)
```

Open `ruleshub.html` directly in a browser (no build step) to interact with the live prototype.

## Build Order Suggestion
1. Tokens + Geist + theme switch.
2. Navbar + Footer + container.
3. PackageCard + ToolBadge + Avatar + Verified.
4. Home (hero + stats + cards).
5. Browse (filters + pagination).
6. Package Detail (tabs + install block + StarButton + sparkline).
7. Profile + Tool + Leaderboard.
8. Dashboard.
9. Publish wizard (most stateful).
10. Docs.
