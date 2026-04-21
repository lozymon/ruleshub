# Web Rules (`apps/web`)

Next.js 15 App Router frontend. See root `CLAUDE.md` for global rules.

---

## Server vs Client Components

- **Server Components by default** — only add `'use client'` when you need interactivity or browser APIs
- When adding `'use client'`, add a one-line comment explaining why
- **Never fetch data inside Client Components** — fetch in Server Components; use React Query only for user-triggered actions
- **No `useEffect` for data fetching**

---

## Routing

- All route paths defined as constants in `lib/routes.ts` — no magic strings anywhere
- Every async page/route segment must have a `loading.tsx` (or `Suspense` boundary)
- Every route segment must have an `error.tsx` boundary

---

## API Calls

- All calls go through typed functions in `lib/api/` — never call `fetch` directly in components
- API base URL comes from `lib/config.ts` — never hardcode

---

## UI Components

- **shadcn/ui first** — always check if a shadcn component exists before building custom
- Custom components live in `components/` — group by feature, not by type
- **Tailwind only** — no inline styles, no CSS modules, no styled-components

---

## Forms

- Always use `react-hook-form` + `zod` resolver
- Never use uncontrolled forms
- Zod schemas for forms come from `packages/types` if they overlap with API shapes

---

## Loading & Error States

- Skeleton cards / shimmer on load — no layout shift
- `error.tsx` must show a user-facing message and a retry button
- Empty states: show a helpful CTA, not just "no results"

---

## Testing

- Component tests with Vitest + Testing Library
- Test behaviour, not markup — no snapshot tests
- No coverage threshold on UI
