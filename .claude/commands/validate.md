# /validate

Validate a `ruleshub.json` manifest — in the current directory or a given path.

## Steps

1. **Locate the manifest** — use the argument if provided, otherwise look in the current directory
2. **Run the CLI validator:**
   ```
   pnpm --filter cli exec node dist/index.js validate [dir]
   ```
   If the CLI isn't built yet, build it first: `pnpm --filter cli build`
3. **Check file references** — open the manifest and verify every file listed under `files` actually exists on disk
4. **Check README** — confirm a `README.md` is present and non-empty
5. **Report** — list every error with the field name and reason; confirm success if clean

## Rules

- Never modify the manifest — read-only operation
- If the CLI build fails, report that clearly rather than guessing at validity
- Use `--json` flag when you need machine-readable output
