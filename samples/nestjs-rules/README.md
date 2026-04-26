# nestjs-rules

NestJS coding conventions for AI coding tools. Enforces module structure,
controller/service separation, Prisma usage, Swagger documentation, and
typed error handling.

## Installation

```bash
npx ruleshub install lozymon/nestjs-rules --tool claude-code
```

## What it installs

| Tool        | File written                      |
| ----------- | --------------------------------- |
| Claude Code | `CLAUDE.md`                       |
| Cursor      | `.cursorrules`                    |
| Copilot     | `.github/copilot-instructions.md` |

## What it covers

- Module structure — every feature in its own module
- Controllers stay thin — no business logic
- Services handle all logic — NestJS exceptions only
- DTOs with class-validator on every request body
- Swagger decorators on every endpoint
- Prisma via injected PrismaService — no direct instantiation
- Paginated list responses: `{ data, total, page, limit }`
- Explicit auth guards on every protected route
- Logger instead of console.log
- No `any`, no hardcoded env vars

## License

MIT
