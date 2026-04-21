# /new-cli-command

Add a new command to `packages/cli`.

## Checklist

1. **Read existing commands first** — check `src/commands/` to understand the patterns in use
2. **Create the command file** — `src/commands/<name>.ts`
3. **Register with commander** — add to `src/index.ts`
4. **Define options:**
   - Every write operation must support `--dry-run` (show what would happen, write nothing)
   - Every write operation must support `--force` (skip conflict confirmation)
   - Every read command must support `--json` (machine-readable output)
   - Add `--quiet` support if the command produces verbose output
5. **Use shared utilities:**
   - API calls → `src/lib/api.ts`
   - File writes → `src/lib/writer.ts` (handles conflict detection and dry-run automatically)
   - Types → `packages/types` (never redefine manifest or API shapes)
6. **Error handling** — throw errors, never call `process.exit` directly; the top-level handler manages exit codes
7. **Write unit tests** — mock the API client and file writer; test the command logic in isolation

## Rules reminder
- Never write files silently — show what will be written first
- Warn before overwriting existing files
- Clear error messages with actionable next steps
- No `console.log` — use the logger so `--quiet` works
- MIT license — no AGPL imports
