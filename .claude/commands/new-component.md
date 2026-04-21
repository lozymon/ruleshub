# /new-component

Scaffold a new React component in `apps/web`.

## Checklist

1. **Check shadcn/ui first** — if a shadcn component covers the use case, use it instead of building custom
2. **Decide Server vs Client:**
   - No interactivity or browser APIs → Server Component (no directive needed)
   - Needs state, event handlers, or browser APIs → Client Component (`'use client'` + one-line comment why)
3. **Place the file** — group by feature under `components/<feature>/`, not by type
4. **Props type** — define a named props interface, never inline or `any`
5. **Loading state** — if the component fetches or streams data, handle the loading state explicitly
6. **Empty state** — if the component renders a list or content that can be empty, handle it with a helpful message or CTA
7. **Tailwind only** — no inline styles, no CSS modules

## Rules reminder
- shadcn/ui before custom
- No `useEffect` for data fetching
- No inline styles
- No `any` props
