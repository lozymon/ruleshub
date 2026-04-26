# NestJS PR Review Workflow

Review a pull request for NestJS rule violations before merging.

## Steps

### 1. Identify changed files

```bash
git diff main...HEAD --name-only
```

### 2. Check each changed file

**Controllers** (`*.controller.ts`):

- [ ] No business logic — only calls service methods
- [ ] Every endpoint has `@ApiOperation({ summary: '...' })`
- [ ] Every endpoint has `@ApiResponse({ status: ... })`
- [ ] Every protected endpoint has `@UseGuards(JwtAuthGuard)` explicitly
- [ ] Every protected endpoint has `@ApiBearerAuth()`

**Services** (`*.service.ts`):

- [ ] No `new PrismaClient()` — must use injected `PrismaService`
- [ ] No `throw new Error(...)` — only NestJS exceptions
- [ ] No `console.log` — use `new Logger(ServiceName.name)`
- [ ] Multi-step writes wrapped in `$transaction`

**DTOs** (`*.dto.ts`):

- [ ] Every field has `class-validator` decorator (`@IsString`, `@IsInt`, etc.)
- [ ] Every field has `@ApiProperty()`
- [ ] No raw `any` types

### 3. Global checks

```bash
# Fail if any of these appear
grep -rn "any" src/ --include="*.ts"
grep -rn "console.log" src/ --include="*.ts"
grep -rn "new PrismaClient" src/ --include="*.ts"
grep -rn "new Error(" src/ --include="*.ts"
```

### 4. Report

Summarise findings:

```
## PR Review — NestJS Rules

✅ Controllers: thin, guards explicit, Swagger complete
✅ Services: PrismaService injected, NestJS exceptions only
⚠️  DTOs: missing @ApiProperty on UserDto.role
❌ Services: console.log found in auth.service.ts:47

Verdict: CHANGES REQUESTED
```

Block merge on any ❌. ⚠️ items are advisory.
