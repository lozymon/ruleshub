# /new-page

Scaffold a new page in `apps/web` (Next.js 15 App Router).

## Checklist

1. **Decide data strategy** — does this page need data? Is it server-fetched or user-triggered?
   - Static or server-fetched → Server Component, fetch in the page or a child Server Component
   - User-triggered (search, form submit) → React Query in a Client Component
2. **Add the route constant** — add the path to `lib/routes.ts` before creating the file
3. **Scaffold the Server Component** — `app/<path>/page.tsx`
4. **Add `loading.tsx`** — skeleton UI, no layout shift
5. **Add `error.tsx`** — user-facing error state with a retry option
6. **Add any API calls to `lib/api/`** — typed fetch functions, never raw `fetch` in components
7. **Mark Client Components** — add `'use client'` only where needed; add a one-line comment explaining why

## Rules reminder
- No inline styles — Tailwind only
- shadcn/ui before custom components
- No `useEffect` for data fetching
- No magic route strings — use `lib/routes.ts`
