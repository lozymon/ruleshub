# RulesHub — Design Tokens

> **Source of truth.** These are the exact values pulled from the live mockup. Use them verbatim. Do not invent variants. Do not approximate.

## How to apply

- All tokens are CSS custom properties on `:root` (dark) and `[data-theme="light"]`.
- Theme is toggled by setting `data-theme="dark|light"` on `<html>`.
- Default theme is **dark**.
- Persist user preference to `localStorage["theme"]`.

```css
:root { /* dark = default */ }
[data-theme="light"] { /* light overrides */ }
```

---

## Surfaces & text

| Token            | Dark        | Light       | Use                                                |
| ---------------- | ----------- | ----------- | -------------------------------------------------- |
| `--bg`           | `#181818`   | `#fafafa`   | Page background                                    |
| `--bg-elev`      | `#1e1e1e`   | `#ffffff`   | Cards, panels, navbar                              |
| `--bg-elev-2`    | `#252526`   | `#f4f4f5`   | Hover row, nested panel, segmented-control filling |
| `--bg-code`      | `#1a1a1a`   | `#1a1a1f`   | (legacy — `.readme pre`. Prefer CodeBlock tokens.) |
| `--fg`           | `#ededf0`   | `#0a0a0b`   | Primary text                                       |
| `--fg-muted`     | `#a1a1aa`   | `#52525b`   | Secondary text, list bullets                       |
| `--border`       | `#2d2d2d`   | `#e4e4e7`   | Dividers, card borders                             |
| `--border-hover` | `#4a4a4a`   | `#a1a1aa`   | Hover ring on cards                                |

## Brand & state

| Token            | Dark        | Light       | Use                                                |
| ---------------- | ----------- | ----------- | -------------------------------------------------- |
| `--accent`       | `#3b82f6`   | `#2563eb`   | Primary buttons, links, focused tab underline      |
| `--accent-hover` | `#60a5fa`   | `#1d4ed8`   | Hover state                                        |
| `--success`      | `#10b981`   | `#10b981`   | Verified badge, "copied" feedback                  |
| `--danger`       | `#ef4444`   | `#ef4444`   | Destructive actions, delete, error                 |

## Layout

| Token        | Value         |
| ------------ | ------------- |
| `--maxw`     | `1240px`      |
| Page gutter  | `24px`        |
| Card radius  | `8px`         |
| Button radius| `6px`         |
| Input radius | `6px`         |

## Typography

| Token         | Value                                                    |
| ------------- | -------------------------------------------------------- |
| `--font-sans` | `'Geist', ui-sans-serif, system-ui, sans-serif`          |
| `--font-mono` | `'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace`|

Type scale:

| Use         | Size  | Weight | Line height |
| ----------- | ----- | ------ | ----------- |
| Page H1     | 28px  | 600    | 1.25        |
| Page H2     | 22px  | 600    | 1.3         |
| Card title  | 16px  | 600    | 1.35        |
| Body        | 14px  | 400    | 1.55        |
| Small       | 13px  | 400    | 1.5         |
| Meta / chip | 12px  | 500    | 1.4         |
| Code        | 12.5px| 400    | 1.6         |

## Shadows

| Token            | Dark                                                          | Light                                                          |
| ---------------- | ------------------------------------------------------------- | -------------------------------------------------------------- |
| `--shadow-hover` | `0 8px 24px -8px rgba(0,0,0,0.6), 0 0 0 1px #4a4a4a`          | `0 8px 24px -8px rgba(0,0,0,0.15), 0 0 0 1px #a1a1aa`          |

---

## Code-block tokens (CodeBlock component)

These are **separate** from the rest of the palette. They make CodeBlock render the same in dark and light **except for the syntax tokens**.

| Token                  | Dark                       | Light                  | Use                                          |
| ---------------------- | -------------------------- | ---------------------- | -------------------------------------------- |
| `--code-bg`            | `#1a1a1a`                  | `#f4f4f5`              | Code body background                         |
| `--code-header-bg`     | `#1f1f23`                  | `#e4e4e7`              | Header strip (BASH / YAML / Copy)            |
| `--code-header-hover`  | `rgba(255,255,255,0.06)`   | `rgba(0,0,0,0.06)`     | Copy-button hover bg                         |
| `--code-border`        | `#2d2d2d`                  | `#f4f4f5`              | Outer border. Light = same as bg (no border) |
| `--code-fg`            | `#adbac7`                  | `#18181b`              | Default code text                            |
| `--code-header-fg`     | `#a1a1aa`                  | `#3f3f46`              | Header label + Copy text                     |

> **Light-only:** `.code-block-header` border-bottom is `#d4d4d8` (lighter divider). Dark uses the default `var(--code-border)`.

## Bash syntax tokens

| Token                  | Dark        | Light       | Maps to            |
| ---------------------- | ----------- | ----------- | ------------------ |
| `--code-tok-prompt`    | `#768390`   | `#71717a`   | `$` prompt         |
| `--code-tok-cmd`       | `#f47067`   | `#b91c1c`   | command (`npx`)    |
| `--code-tok-arg`       | `#adbac7`   | `#18181b`   | first arg (`ruleshub`) |
| `--code-tok-flag`      | `#f69d50`   | `#b45309`   | `--flag`           |
| `--code-tok-value`     | `#96d0ff`   | `#1d4ed8`   | flag value         |

## YAML/JS syntax tokens

| Token                  | Dark        | Light       | Maps to            |
| ---------------------- | ----------- | ----------- | ------------------ |
| `--code-tok-string`    | `#96d0ff`   | `#1d4ed8`   | `"strings"`        |
| `--code-tok-keyword`   | `#f47067`   | `#b91c1c`   | keys, keywords     |
| `--code-tok-fn`        | `#dcbdfb`   | `#6d28d9`   | function names     |
| `--code-tok-num`       | `#6cb6ff`   | `#1d4ed8`   | numbers            |
| `--code-tok-type`      | `#5eb5f5`   | `#0369a1`   | types              |
| `--code-tok-comment`   | `#768390`   | `#71717a`   | comments           |

---

## Tool brand colors (for ToolBadge / ToolPill)

| ID            | Label              | Hex         |
| ------------- | ------------------ | ----------- |
| `cursor`      | Cursor             | `#000000`   |
| `claude-code` | Claude Code        | `#D97757`   |
| `windsurf`    | Windsurf           | `#0E9F6E`   |
| `copilot`     | GitHub Copilot     | `#6366F1`   |
| `cline`       | Cline              | `#10B981`   |
| `aider`       | Aider              | `#F59E0B`   |
| `continue`    | Continue           | `#7C3AED`   |

The ToolBadge wraps a 1ch glyph + label in a pill with a 1px border tinted from the brand color at low alpha. See `components.md`.
