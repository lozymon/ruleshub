# /pr-review

Review the current diff against the project rules.

## Checklist

Run through each category and flag any violations:

### Backend (`apps/api`)
- [ ] Every new endpoint has `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth` (if protected)
- [ ] Every protected endpoint has `@UseGuards(JwtAuthGuard)` explicitly
- [ ] No business logic in controllers — only service calls
- [ ] All request bodies use DTOs with `class-validator` decorators
- [ ] No `any` types
- [ ] No `console.log`
- [ ] No raw SQL without an explanation comment
- [ ] No direct `PrismaClient` instantiation
- [ ] Errors thrown as NestJS built-in exceptions only
- [ ] List endpoints return `{ data, total, page, limit }`

### Frontend (`apps/web`)
- [ ] No `fetch` called directly in components — goes through `lib/api/`
- [ ] No magic route strings — uses `lib/routes.ts`
- [ ] No `useEffect` for data fetching
- [ ] `'use client'` usage is justified (comment present)
- [ ] Every new async page has `loading.tsx` and `error.tsx`
- [ ] No inline styles — Tailwind only
- [ ] Forms use `react-hook-form` + `zod`
- [ ] No `any` types

### General
- [ ] No hardcoded env vars
- [ ] No placeholder / TODO code left in
- [ ] Commit messages follow `type(scope): description` format

Report each violation with the file path and line number.
