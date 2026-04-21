# Types Rules (`packages/types`)

Shared TypeScript types and Zod schemas consumed by `apps/api`, `apps/web`, and `packages/cli`.
Licensed MIT — keep this package free of any AGPL dependencies.

---

## What Goes Here

- `PackageManifest` and all related manifest types
- API request/response types shared across apps
- Zod schemas for manifest validation and form validation
- Supported tools enum and tool config types

## What Does NOT Go Here

- Business logic
- App-specific types that are only used in one app (keep those local)
- Any runtime dependencies beyond `zod`

---

## Rules

- Every exported type must have a corresponding Zod schema where user input is involved
- Zod schemas are the source of truth — derive TypeScript types from them with `z.infer<>`
- All exports are named exports — no default exports
- No breaking changes without a version bump — these types are consumed by the CLI and future IDE extensions
- Unit test every Zod schema: valid input passes, invalid input fails with the expected error

---

## File Structure

```
src/
  manifest.ts       # PackageManifest schema + type
  api.ts            # API request/response types
  tools.ts          # Supported tools enum + config
  index.ts          # Re-exports everything
```
