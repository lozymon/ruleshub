# API Rules (`apps/api`)

NestJS REST API. See root `CLAUDE.md` for global rules.

---

## Module Structure

Every feature gets its own NestJS module. No exceptions.

```
src/<feature>/
  <feature>.module.ts
  <feature>.controller.ts
  <feature>.service.ts
  dto/
    create-<feature>.dto.ts
    update-<feature>.dto.ts
  entities/
    <feature>.entity.ts
```

Register every new module in `src/app.module.ts`.

---

## Controllers

- Thin — no business logic, only call service methods and return DTOs
- Every endpoint must have `@ApiOperation`, `@ApiResponse`, and `@ApiBearerAuth` (if protected)
- Every protected route must have `@UseGuards(JwtAuthGuard)` explicitly — never rely on global defaults

---

## DTOs

- All request bodies use DTOs with `class-validator` decorators
- All response shapes are typed — use types from `packages/types` where possible

---

## Services

- All business logic lives here
- Inject `PrismaService` — never instantiate `PrismaClient` directly
- Wrap multi-step operations in `$transaction`
- No raw SQL unless absolutely necessary — if used, add a comment explaining why
- Throw NestJS built-in exceptions only: `NotFoundException`, `ForbiddenException`, `ConflictException`, `BadRequestException`, etc.
- Never `throw new Error()`

---

## Response Format

All list/paginated endpoints return:

```ts
{ data: T[], total: number, page: number, limit: number }
```

---

## Logging

Use the NestJS `Logger` class — never `console.log`.

```ts
private readonly logger = new Logger(FeatureService.name);
```

---

## Environment Variables

Always reference via `ConfigService` — never `process.env` directly.

---

## Testing

- e2e tests with Supertest against a real test database — no mocks
- Test files live alongside their module in `src/<feature>/<feature>.e2e-spec.ts`
- 80% coverage threshold on business logic
