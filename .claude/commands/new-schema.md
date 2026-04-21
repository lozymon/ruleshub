# /new-schema

Add a new type or Zod schema to `packages/types`.

## Checklist

1. **Decide the file** — does this belong in `manifest.ts`, `api.ts`, `tools.ts`, or a new file?
2. **Write the Zod schema first** — the schema is the source of truth
3. **Derive the TypeScript type** from the schema using `z.infer<>` — never write a separate interface that duplicates the schema
4. **Export from `index.ts`** — add named exports; no default exports
5. **Write unit tests** — at minimum:
   - Valid input passes validation
   - Each required field missing causes a failure
   - Invalid field values cause a failure with a descriptive error
6. **Check for breaking changes** — if you're modifying an existing schema, check all consumers (`apps/api`, `apps/web`, `packages/cli`) before changing

## Rules reminder
- `z.infer<>` for types — never duplicate type definitions
- Named exports only
- No runtime dependencies beyond `zod`
- MIT license — no AGPL imports
