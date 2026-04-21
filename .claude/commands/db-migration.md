# /db-migration

Update the Prisma schema and create a migration.

## Checklist

1. **Update `apps/api/prisma/schema.prisma`** — make the schema change
2. **Generate the migration** — run:
   ```
   pnpm --filter api prisma migrate dev --name <descriptive-name>
   ```
3. **Review the generated SQL** — open the migration file in `prisma/migrations/` and read it before applying
   - Check for destructive operations (DROP COLUMN, DROP TABLE)
   - Check for NOT NULL columns added to existing tables (needs a default or a two-step migration)
4. **Apply in dev** — migration runs automatically with `migrate dev`; confirm it succeeded
5. **Update seed if needed** — if `prisma/seed.ts` references the changed schema, update it
6. **Update shared types** — if the schema change affects API response shapes, update `packages/types`

## Rules reminder
- Never use raw SQL unless absolutely necessary; document why if you do
- Always wrap multi-step Prisma operations in `$transaction`
- Never instantiate `PrismaClient` directly — use the injected `PrismaService`
