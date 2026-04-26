# NestJS Generate Module

Scaffold a complete NestJS feature module given a feature name.

## Usage

```
/nestjs-generate-module <feature-name>
```

## What to generate

Create the following files at `src/<feature-name>/`:

```
src/<feature-name>/
  <feature-name>.module.ts
  <feature-name>.controller.ts
  <feature-name>.service.ts
  dto/
    create-<feature-name>.dto.ts
    update-<feature-name>.dto.ts
```

## Rules (from CLAUDE.md)

**Controller** — thin, no business logic:

- Every endpoint: `@ApiOperation`, `@ApiResponse`
- Protected routes: `@UseGuards(JwtAuthGuard)` + `@ApiBearerAuth()`
- Return service result directly — no transformation

**Service** — all logic here:

- Inject `PrismaService` via constructor — never `new PrismaClient()`
- Throw only NestJS exceptions: `NotFoundException`, `ForbiddenException`, `ConflictException`, `BadRequestException`
- Use `Logger` — never `console.log`
- Wrap multi-step writes in `$transaction`

**DTOs** — every request body:

- `class-validator` decorators on every field
- `@ApiProperty()` on every field
- Separate `Create` and `Update` DTOs — `UpdateDto` extends `PartialType(CreateDto)`

**After generating** — register the module in `src/app.module.ts`.
