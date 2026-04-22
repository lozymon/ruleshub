# Handoff: RulesHub — Next.js 15 + Tailwind + shadcn/ui

## Overview

RulesHub is a package registry and marketplace for AI coding tool configuration — rules, commands, workflows, agents, and MCP server configs. Think npm, but for AI tool assets. Developers publish a package once and it works across Claude Code, Cursor, GitHub Copilot, Windsurf, Cline, Aider, and Continue.

**Domain:** ruleshub.dev
**Audience:** Intermediate → senior software developers
**Tone:** Developer-focused, no marketing fluff — clean, fast, trustworthy

---

## About the Design Files

The files in `design-reference/` are **design references created as a static HTML/React prototype** — they show intended look, layout, and behavior. They are **not production code** and should not be copy-pasted.

Your task is to **recreate these designs in the target codebase**:

- **Next.js 15 App Router**
- **Tailwind CSS**
- **shadcn/ui** components

Use existing codebase conventions; map my custom primitives onto shadcn equivalents rather than lifting my CSS verbatim.

---

## Fidelity

**High-fidelity.** Final colors, spacing, typography, and interactions are locked. Recreate pixel-close using shadcn/ui and Tailwind — exact hex values, spacing scale, and type ramps are documented below.

---

## File Map (what's in `design-reference/`)

| File                          | Purpose                                                             |
| ----------------------------- | ------------------------------------------------------------------- |
| `ruleshub.html`               | Entry point — loads all scripts                                     |
| `styles.css`                  | Global styles + design tokens (source of truth for colors/spacing)  |
| `data.jsx`                    | Mock package/user data + icon set + tool/type enums                 |
| `components.jsx`              | Navbar, PackageCard, ToolBadge, Avatar, Verified, Sparkline, Footer |
| `pages-home-browse.jsx`       | HomePage + BrowsePage                                               |
| `pages-package.jsx`           | Package Detail page (tabs, install block, star button)              |
| `pages-profile-tool-lb.jsx`   | Profile, Tool, Leaderboard pages                                    |
| `pages-dashboard-publish.jsx` | Dashboard + multi-step Publish flow                                 |
| `tweaks.jsx`                  | In-prototype variant switcher (not needed in production)            |
| `app.jsx`                     | Router + theme state                                                |

---

## Routes (App Router mapping)

| URL                            | File                                                                 |
| ------------------------------ | -------------------------------------------------------------------- |
| `/`                            | `app/page.tsx` — HomePage                                            |
| `/browse`                      | `app/browse/page.tsx` — supports `?tool=` and `?type=` search params |
| `/packages/[namespace]/[name]` | `app/packages/[namespace]/[name]/page.tsx`                           |
| `/users/[username]`            | `app/users/[username]/page.tsx`                                      |
| `/tools/[tool]`                | `app/tools/[tool]/page.tsx`                                          |
| `/leaderboard`                 | `app/leaderboard/page.tsx`                                           |
| `/dashboard`                   | `app/dashboard/page.tsx` (auth required)                             |
| `/publish`                     | `app/publish/page.tsx` (auth required)                               |
| `/auth/callback`               | `app/auth/callback/route.ts` — GitHub OAuth redirect handler         |

---

## Design Tokens

### Colors (Dark — default)

```css
--bg: #0a0a0b --bg-elev: #111114 /* cards */ --bg-elev-2: #17171c
  /* nested surfaces */ --bg-code: #0d0d10 /* install blocks, file previews */
  --border: #23232a --border-strong: #2e2e37 --border-hover: #3a3a45
  --fg: #ededf0 --fg-muted: #a1a1aa --fg-dim: #71717a --fg-faint: #52525b
  --accent: #3b82f6 /* blue-500 */ --accent-hover: #60a5fa /* blue-400 */
  --accent-dim: #1d4ed8 --star: #f5c518 --success: #10b981 --danger: #ef4444
  --warn: #f59e0b;
```

### Colors (Light)

```css
--bg: #fafafa --bg-elev: #ffffff --bg-elev-2: #f4f4f5 --border: #e4e4e7
  --border-strong: #d4d4d8 --fg: #0a0a0b --fg-muted: #52525b --fg-dim: #71717a
  --fg-faint: #a1a1aa --accent: #2563eb;
```

Use Tailwind's `dark:` variant, driven by a class on `<html>`. Wire up `next-themes` to manage it.

### Tool Brand Colors

Used as the left dot in `ToolBadge` pills.

```
claude-code  #d97757
cursor       #4a9eff
copilot      #3fb950
windsurf     #22d3ee
cline        #a78bfa
aider        #eab308
continue     #8b8cf8
```

### Typography

- **UI:** Geist (Google Fonts) — weights 400, 500, 600, 700
- **Mono:** Geist Mono — weights 400, 500, 600
- Ship via `next/font/google` and assign CSS variables `--font-sans` / `--font-mono`.

**Type ramp:**

| Usage                       | Size      | Weight  | Letter-spacing |
| --------------------------- | --------- | ------- | -------------- |
| Hero H1                     | 56px      | 600     | -0.035em       |
| Page H1                     | 26-28px   | 600     | -0.02em        |
| Section title               | 20px      | 600     | -0.015em       |
| Card title (pkg name, mono) | 14px      | 500     | -0.01em        |
| Body                        | 14px      | 400     | 0              |
| Secondary                   | 13-13.5px | 400/500 | 0              |
| Label (UPPERCASE)           | 11-12px   | 600     | 0.06-0.08em    |
| Mono small                  | 12-12.5px | 500     | 0              |

### Spacing / Radii

- Container max-width: **1240px**, 24px horizontal padding
- Radii: `--radius: 6px` (inputs, buttons, badges), `--radius-lg: 10px` (cards, sidebar cards), `12-14px` for tool logo tiles
- Card padding: 18px (list cards), 16px (sidebar cards)
- Section vertical padding: 48px
- Navbar height: 56px (sticky, `backdrop-blur`)

---

## Component Inventory → shadcn Map

| Design component                                | shadcn primitive                             | Notes                                                                 |
| ----------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------- |
| Buttons (primary/outline/ghost, sm/md/lg, icon) | `Button` + variants                          | 34px height default; 40px `lg`; 28px `sm`; 34×34 icon                 |
| Nav dropdown (avatar menu)                      | `DropdownMenu`                               |                                                                       |
| Theme toggle                                    | `next-themes` + `Button`                     | icon-only                                                             |
| Search input (navbar + browse)                  | `Input` with leading icon + `kbd`            | ⌘K hotkey opens `CommandDialog`                                       |
| Tool filter tabs / package detail tabs          | `Tabs`                                       | bottom border-accent on active                                        |
| Asset type filter sidebar                       | Plain buttons / `ToggleGroup`                |                                                                       |
| Package Card                                    | `Card`                                       | see structure below                                                   |
| Install command block                           | Custom                                       | 4 variants (npx/pnpm/bun/--tool) as `Tabs` inside a `Card`            |
| Copy-to-clipboard button                        | `Button` + `use-clipboard`                   | success state swaps icon to check + green                             |
| Version picker                                  | `DropdownMenu`                               |                                                                       |
| Star button                                     | Custom                                       | uses `useOptimistic`; burst animation 500ms cubic-bezier(.5,1.8,.4,1) |
| Versions table / Dashboard table                | `Table`                                      |                                                                       |
| README tab                                      | Render MDX or remark → rehype                |                                                                       |
| Files tab                                       | Split pane + `shiki` for syntax highlighting |                                                                       |
| Comments tab                                    | Custom; use `Textarea` + `Avatar`            |
| Leaderboard rows                                | Plain list                                   | top-3 rank color (gold/silver/bronze)                                 |
| Publish stepper                                 | Custom; `Progress` or bordered step pills    |                                                                       |
| File dropzone                                   | `react-dropzone` + custom styling            |                                                                       |
| Tool target checkboxes                          | `Checkbox` rows with mono path text          |
| Validation list                                 | Custom; green check / red X                  |
| Dry-run output                                  | `pre` with monospace                         |                                                                       |
| Empty states                                    | Custom; icon + heading + CTA                 |                                                                       |
| Skeleton                                        | `Skeleton`                                   | shimmer animation                                                     |
| Toasts (publish success, copy)                  | `sonner`                                     |                                                                       |

### Package Card anatomy

```
┌────────────────────────────────────────────┐
│ [type icon 32×32]  ns/name ✓ [type pill]   │
│                    updated 2d ago          │
│                                            │
│ Description — 2 lines, line-clamp-2        │
│                                            │
│ [● Claude Code] [● Cursor] [+2]            │
│ ────────────────────────────────────       │
│ ★ 2,847    ↓ 124.3k          v2.4.1       │
└────────────────────────────────────────────┘
```

- Bg: `--bg-elev`, 1px `--border`, radius 10px
- Hover: `translateY(-1px)`, border → `--border-hover`, shadow `0 8px 24px -8px rgba(0,0,0,0.6)`, 180ms ease
- Meta row: top border, monospace 12px, `star` + `download` + `version` (version right-aligned)

---

## Interactions

- **Navbar:** sticky with 12px backdrop-blur; ⌘K focuses search from anywhere
- **Theme toggle:** persisted via `next-themes` (localStorage)
- **Tool tabs:** filter cards in-page (no navigation) — except on Home, where clicking a tool card routes to `/tools/[tool]`
- **Package Card click:** routes to detail
- **Copy button:** 1500ms success state, icon swap check, text "Copied"
- **Star button:** optimistic toggle; burst animation on transition to starred (scale 1 → 1.4 → 1.1, rotate 10°, 500ms)
- **Publish stepper:** forward locked behind validation; back always available. Tools checkboxes show per-tool file path dynamically.

---

## States

Every page that loads data must implement:

1. **Loading** — skeleton cards matching the real card shape (mock in `SkeletonCard` component)
2. **Empty** — centered icon tile + heading + CTA (see `.empty-state` in `styles.css`)
3. **Error** — friendly message + retry button (follow empty-state shape)

### Star button states

- Default → Hover → Starred (filled yellow `#f5c518`, border `--star`) → Bursting (one-shot animation class for 500ms)

---

## Responsive

| Breakpoint   | Cards |
| ------------ | ----- |
| `<640px`     | 1 col |
| `640–1024px` | 2 col |
| `≥1024px`    | 3 col |

- Nav collapses to hamburger on `<720px` (use `Sheet`)
- Browse sidebar filters move into a `Sheet` / drawer on mobile
- Hero H1 scales down to ~40px on mobile

---

## Auth Flow

- GitHub OAuth — login button triggers `/api/auth/signin/github`
- `/auth/callback` exchanges code → session → redirect to `/dashboard`
- Session surfaces in server components via `auth()` helper; use NextAuth v5 or `better-auth`

---

## Data Model (sketch)

```ts
type AssetType = 'rule' | 'command' | 'workflow' | 'agent' | 'mcp' | 'pack';
type ToolId =
  | 'claude-code'
  | 'cursor'
  | 'copilot'
  | 'windsurf'
  | 'cline'
  | 'aider'
  | 'continue';

interface Package {
  namespace: string;
  name: string;
  description: string;
  type: AssetType;
  tools: ToolId[];
  version: string; // latest
  stars: number;
  downloads: number;
  verified: boolean;
  updatedAt: string; // ISO
  repoUrl?: string;
  license?: string;
}
```

See `data.jsx` for realistic example data to seed dev DB.

---

## What NOT to build

- No marketing sections (pricing, testimonials, feature lists)
- No onboarding wizard — GitHub login is the entire onboarding
- No custom per-page illustrations — one consistent empty-state pattern throughout
- No analytics beyond the sparkline on package detail + dashboard chart

---

## Assets

- **Fonts:** Geist + Geist Mono via `next/font/google`
- **Icons:** custom SVG set in `data.jsx` — replace with `lucide-react` (names map directly: `star`, `download`, `github`, `clock`, `flame`, `trophy`, `terminal`, etc.)
- **Tool logos:** placeholders (colored tile with first letter). Real implementation should ship actual tool logos (SVG) — request from user.

---

## Suggested Implementation Order

1. **Scaffold:** `create-next-app`, install Tailwind, shadcn CLI init, install primitives listed above
2. **Tokens:** wire CSS variables in `app/globals.css`, extend `tailwind.config.ts` with them
3. **Layout + navbar + footer**
4. **Home** (hero, stats, tool tabs, card grids) — read-only data
5. **Browse + Package Card** (shared across many pages)
6. **Package Detail** — tabs, install block, star button, sparkline
7. **Profile, Tool, Leaderboard** (all reuse PackageCard)
8. **Dashboard + Publish flow** (auth-gated)
9. **Loading/empty/error states per route**
10. **Mobile polish**
