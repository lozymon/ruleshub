# CLI Rules (`packages/cli`)

`npx ruleshub` CLI tool. Licensed MIT — keep free of AGPL dependencies.

---

## Principles

- **Zero config for the happy path** — `npx ruleshub install <name>` should just work
- **Never write files silently** — always show what will be written before writing it
- **Warn before overwriting** — detect conflicts and ask for confirmation; support `--force` to skip
- **Dry run always available** — every write operation must support `--dry-run`
- **Fail loudly** — clear error messages with actionable next steps; no silent failures

---

## Structure

```
src/
  commands/         # One file per command (install, publish, outdated, update)
  lib/              # Shared utilities (api client, file writer, manifest reader)
  index.ts          # CLI entry point (commander setup)
```

---

## Rules

- Use `commander` for argument parsing — no custom arg parsing
- Use types from `packages/types` for all manifest and API shapes — never redefine them
- API calls go through a shared client in `src/lib/api.ts` — never call `fetch` directly in commands
- All file writes go through `src/lib/writer.ts` — centralises conflict detection and dry-run logic
- Never use `process.exit` directly — throw errors and let the top-level handler exit
- No `console.log` for structured output — use a logger that can be silenced with `--quiet`
- Support `--json` flag on all read commands for machine-readable output (useful for IDE extensions)

---

## Testing

- Unit test each command's logic in isolation (mock the API client and file writer)
- Integration test the full install flow against a local fixture package
