# RulesHub — Design Handoff

A complete design reference for **RulesHub**, a package registry for AI-coding-tool rule sets (Cursor rules, Claude Code commands, Windsurf workflows, GitHub Copilot instructions, Cline agents, Aider config, Continue rules).

> **For Claude Code:** open `prompt.md` and paste it into your first message. It tells you exactly how to use this folder.

---

## What's in this folder

| Path                        | What it is                                                  |
| --------------------------- | ----------------------------------------------------------- |
| `prompt.md`                 | **Start here.** Paste-ready opening prompt for Claude Code. |
| `tokens.md`                 | Every CSS custom property, exact value, both themes.        |
| `components.md`             | Anatomy + gotchas for components that are easy to break.    |
| `screenshots/dark/`         | 10 reference screenshots, dark theme.                       |
| `screenshots/light/`        | 7 reference screenshots, light theme.                       |
| `source/ruleshub.html`      | The mockup — open in a browser to interact with it.         |
| `source/styles.css`         | Source of truth for tokens & component CSS.                 |
| `source/*.jsx`              | The prototype's React components (inline Babel; reference only). |

`source/` is **reference, not target**. The prototype uses inline Babel + global scripts; the production app should be a normal Next.js project.

---

## Product summary

RulesHub is "npm for AI coding rules." Users:

1. **Browse / search** packages of rules, commands, workflows, agents.
2. **Install** them into their tool of choice via a one-line CLI: `npx ruleshub add @microsoft/typescript-strict`.
3. **Publish** their own packages, versioned, scoped under a username or org.
4. **Discover** via the home feed, leaderboards, tool-specific pages, and trending tags.

### Supported tools

| ID            | Label              | Brand color |
| ------------- | ------------------ | ----------- |
| `cursor`      | Cursor             | `#000000`   |
| `claude-code` | Claude Code        | `#D97757`   |
| `windsurf`    | Windsurf           | `#0E9F6E`   |
| `copilot`     | GitHub Copilot     | `#6366F1`   |
| `cline`       | Cline              | `#10B981`   |
| `aider`       | Aider              | `#F59E0B`   |
| `continue`    | Continue           | `#7C3AED`   |

### Page list

1. **Home** — hero, animated stats bar, trending packages, recently updated, top tools.
2. **Browse** — search, ToolTabs filter, sort, package grid.
3. **Package detail** — header card with install command, README/Files/Versions/Reviews tabs, sidebar with publisher, license, deps.
4. **Docs** — sidebar TOC + main column with prose + CodeBlock samples (Getting Started, Publishing, CLI reference, etc.).
5. **Publish** — 3-step flow: choose tool → upload/configure → review & publish.
6. **Profile** — `/u/:username` — packages, stars, contribution graph.
7. **Tool page** — `/tool/:id` — landing page for one tool with curated packs.
8. **Leaderboard** — top publishers, top packages, top growers (week/month/all).
9. **Dashboard** — `/dashboard` — your packages, drafts, analytics, settings.
10. **404 / empty states** — handled inline.

---

## Stack target

- **Next.js 14 App Router**, TypeScript
- **Tailwind CSS** with our tokens mapped to CSS vars in `globals.css`
- **shadcn/ui** for primitives
- **next/font** with Geist + Geist Mono
- **lucide-react** icons
- **next-themes** for theme switching

See `prompt.md` for the full implementation contract.

---

## How to use this handoff

1. Open `source/ruleshub.html` in a browser. Click around. Toggle the theme. This is the target.
2. Open `prompt.md` and paste it into Claude Code, with this folder dragged in as context.
3. Reference `screenshots/` while building — match them.
4. When in doubt about a value, open `tokens.md`. When in doubt about a component, open `components.md`.

If something in the screenshots seems to disagree with `tokens.md`, **the screenshots win** — re-grab the value from the live mockup.
