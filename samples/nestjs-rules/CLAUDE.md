# NestJS Rules

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
```

Register every new module in `src/app.module.ts`.

---

## Controllers

- Thin — no business logic, only call service methods and return DTOs
- Every endpoint must have `@ApiOperation`, `@ApiResponse`, and `@ApiBearerAuth` (if protected)
- Every protected route must have `@UseGuards(JwtAuthGuard)` explicitly — never rely on global defaults

```ts
@Get()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'List items' })
@ApiResponse({ status: 200 })
list(@Req() req: Request) {
  return this.service.list((req.user as User).id);
}
```

---

## Services

- All business logic lives here
- Inject `PrismaService` — never instantiate `PrismaClient` directly
- Wrap multi-step operations in `$transaction`
- Throw NestJS built-in exceptions only: `NotFoundException`, `ForbiddenException`, `ConflictException`, `BadRequestException`
- Never `throw new Error()`
- Use `Logger` class — never `console.log`

```ts
@Injectable()
export class FeatureService {
  private readonly logger = new Logger(FeatureService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const item = await this.prisma.item.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Item ${id} not found`);
    return item;
  }
}
```

---

## DTOs

- All request bodies use DTOs with `class-validator` decorators
- Response shapes are typed — never return raw Prisma models directly

```ts
export class CreateItemDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
```

---

## Response Format

All paginated list endpoints return:

```ts
{ data: T[], total: number, page: number, limit: number }
```

---

## Prisma

- Always use the injected `PrismaService`
- Wrap multi-step writes in `$transaction`
- No raw SQL — use the Prisma query API
- Use `select` or `include` deliberately — never fetch more than needed

```ts
// Good
const [data, total] = await this.prisma.$transaction([
  this.prisma.item.findMany({ where, skip, take }),
  this.prisma.item.count({ where }),
]);

// Bad — never do this
const prisma = new PrismaClient();
```

---

## Auth Guards

- Every protected route must declare `@UseGuards(JwtAuthGuard)` explicitly
- Never rely on global guards — always be explicit

```ts
// Always explicit per-route
@Post()
@UseGuards(JwtAuthGuard)
create() { ... }
```

---

## Swagger

Every endpoint must have:

- `@ApiOperation({ summary: '...' })`
- `@ApiResponse({ status: 200 | 201 | 204 | 400 | 403 | 404 })`
- `@ApiBearerAuth()` on protected routes
- `@ApiParam({ name: '...' })` for path params

---

## Error Handling

```ts
// Correct
throw new NotFoundException(`User ${id} not found`);
throw new ForbiddenException("Insufficient permissions");
throw new ConflictException("Email already in use");
throw new BadRequestException("Invalid input");

// Wrong — never do this
throw new Error("something went wrong");
```

---

## General

- Never use `any` — type explicitly or use `unknown`
- Never use `console.log` — use `Logger`
- Never hardcode environment variables — use `ConfigService`
- Never duplicate types — use shared DTOs and interfaces
