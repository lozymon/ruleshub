# /new-feature

Scaffold a new NestJS feature module in `apps/api`.

## Checklist

1. **Read first** — read any existing related modules before writing anything
2. **Plan DTOs** — define request/response shapes; reuse types from `packages/types` where possible
3. **Plan service methods** — list what the service will do before writing it
4. **Plan controller endpoints** — list routes, HTTP methods, guards, and swagger decorators
5. **Implement in order:**
   - `dto/` files first (with `class-validator` decorators)
   - `<feature>.service.ts` (inject `PrismaService`, throw NestJS exceptions only)
   - `<feature>.controller.ts` (thin, all swagger decorators, explicit guards)
   - `<feature>.module.ts` (wire everything up)
   - Register the module in `app.module.ts`
6. **Write e2e tests** — use Supertest against a real test database, not mocks

## Rules reminder
- No `any`
- No raw SQL
- All list endpoints return `{ data, total, page, limit }`
- Every protected route has `@UseGuards(JwtAuthGuard)` explicitly
