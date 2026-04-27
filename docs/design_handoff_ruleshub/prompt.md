# Opening prompt for Claude Code

Copy everything below and paste it as your **first message** to Claude Code, after dragging the `design_handoff_ruleshub/` folder into the project.

---

## PASTE STARTS HERE

You're building **RulesHub**, a package registry / hub for AI-coding-tool rule sets (Cursor rules, Claude Code commands, Windsurf workflows, Copilot instructions, etc.). Think "npm for AI rules."

I've attached a complete design handoff in `design_handoff_ruleshub/`. **Read it fully before writing any code.** In order:

1. `README.md` — product overview, IA, page list, user flows
2. `tokens.md` — the exact CSS custom properties (dark + light). Use these values verbatim.
3. `components.md` — anatomy + gotchas for the components that are easy to get wrong
4. `screenshots/dark/` and `screenshots/light/` — pixel reference for every page
5. `source/` — the original HTML mockup files. Look at these when you're unsure how something is structured.

## Stack

- **Next.js 14 App Router**, TypeScript, React 18
- **Tailwind CSS** for utilities — but **map our design tokens to CSS custom properties** in `globals.css`, then reference them via `bg-[var(--bg-elev)]` etc. Do **not** redefine the palette in `tailwind.config`.
- **shadcn/ui** for primitives (`Button`, `Input`, `Tabs`, `Dialog`, `Dropdown`). Override default theme to use our tokens.
- `next/font` with **Geist** + **Geist Mono**
- `lucide-react` for icons (replaces my hand-drawn `<Icon>` component)
- `next-themes` for theme switching, persisting to `localStorage["theme"]`

## Build order — **follow this exactly**

1. **Tokens & globals first.** Set up `globals.css` with all CSS variables from `tokens.md` for both `:root` (dark = default) and `[data-theme="light"]`. Verify visually with one button before moving on.
2. **Shared layout** — Navbar, Footer, page shell with `--maxw: 1240px` and 24px gutter.
3. **CodeBlock component** — read `components.md` § CodeBlock fully. There are 6 numbered gotchas. None are optional.
4. **PackageCard, ToolBadge, Badge, Avatar** — the small reusable atoms.
5. **Pages in this order**: Home → Browse → Package detail → Docs → Publish → Profile → Tool page → Leaderboard → Dashboard.
6. After every page, compare side-by-side with the screenshot. If anything is off by more than a few px, fix it before moving on.

## Match these exactly — no exceptions

- **Every hex value in `tokens.md`** is the value, not "approximately." Don't substitute Tailwind defaults like `slate-900` for `--bg`.
- **Page max width is 1240px** with 24px gutter. Not 1280, not 1200.
- **Card border-radius is 8px**, button is 6px, input is 6px.
- **Default theme is dark.** First paint must be dark — use a tiny inline script in `<head>` to set `data-theme` before hydration to avoid the flash.
- **Code-block header bg is `#1f1f23` in dark, `#e4e4e7` in light.** No alpha, no inline overrides.
- **Tool tabs** use a full-width `border-bottom` on the wrapper + a `::after` underline on the active tab. Don't redo this another way.
- **Stats numbers animate in** on mount (count-up, 600ms ease-out).

## Things that bit us last time — pre-empt them

- A generic `.prose pre` style bled into our CodeBlock and painted a second box inside it. **Scope your prose styles** so they don't apply to `.code-block *`.
- An inline `style={{ backgroundColor: ... }}` on the code header overrode the CSS token and broke theme switching. **Don't write inline styles for anything theme-able.**
- The home stats bar is a single row with `·` separators, not a grid of cards.
- The "GitHub Copilot" tool brand is `#6366F1` (indigo). Don't use GitHub's grey.

## Deliverable

A working Next.js app that I can `pnpm dev` and have it match the screenshots. Don't add features I haven't asked for. Don't add a CMS. Don't wire to a real backend — mock data in `lib/mock.ts` is fine.

When you're done, run through `screenshots/dark/` and `screenshots/light/` once more against your running app and tell me anything that doesn't match.

## PASTE ENDS HERE
