# npm Wrapper Rules (`packages/cli`)

`ruleshub` published to npm — a wrapper around the canonical Rust binary, **not** a CLI implementation. Licensed MIT — keep free of AGPL dependencies.

---

## Architecture

This package is intentionally tiny (~3 KB published). It does **not** implement any CLI logic. CLI behaviour lives in [`packages-rs/cli`](../../packages-rs/cli/) (the Rust binary). This wrapper:

1. On `npm install`, downloads the matching binary from GitHub Releases via [`tools/install.js`](./tools/install.js).
2. On `npx ruleshub <args>` / `ruleshub <args>`, [`bin/ruleshub.js`](./bin/ruleshub.js) exec's the downloaded binary with the user's argv.

The same binary ships through Composer (`packages-php/cli`), pip (`packages-py/cli`), `cargo install`, and the curl install script. **No reimplementation in any language.**

---

## Structure

```
packages/cli/
├── package.json          # name: "ruleshub", version matches binary
├── bin/
│   ├── ruleshub.js       # Node launcher, exec's bin/ruleshub-bin
│   └── ruleshub-bin      # native binary, placed by postinstall (gitignored)
├── tools/
│   └── install.js        # postinstall: download + SHA256 verify + place
├── README.md
├── LICENSE
└── CLAUDE.md
```

No `src/`, no TypeScript, no `dist/`. If you find yourself wanting to add either, you're probably trying to add CLI behaviour — that goes in [`packages-rs/cli`](../../packages-rs/cli/) instead. See [the architecture doc](../../apps/web/src/docs/contributing/cli-architecture.mdx).

---

## Rules

- **Wrapper does not contain CLI logic.** Anything beyond "download binary" / "exec binary" belongs in the Rust crate.
- **Match version with the Rust binary.** When the binary version bumps, the npm package version bumps to the same number. Use [`scripts/bump-cli-version.py`](../../scripts/bump-cli-version.py) — it now updates this `package.json` too.
- **Errors from `tools/install.js` must not propagate** (`exit 0` on failure, log to stderr). Failing here would abort the user's whole `npm install`. The launcher prints a helpful runtime error if the binary's missing.
- **Engines constraint stays at `node >= 18`.** Built-in `fetch` is the only Node 18+ feature we use; bumping requires a real reason.
- **No runtime dependencies.** `dependencies: {}` and stays that way. Native `node:*` modules only.
- **`postinstall` script must work with `--ignore-scripts`.** It won't run, the launcher will report the missing binary, the user follows the printed `npm rebuild ruleshub` hint.

---

## Testing

- **CI smoke test** lives at `.github/workflows/cli-npm.yml` (TODO — pending).
- The Rust binary's test suite covers all CLI behaviour. The wrapper smoke test only verifies "platform detection works, binary launches, `--version` matches expected".
- No unit tests in this package. The wrapper has no logic worth unit-testing.

---

## When you change `tools/install.js`

- Bump `BINARY_VERSION` only via `scripts/bump-cli-version.py`. Manual edits drift from the Rust crate version.
- New supported platforms (e.g. Linux RISC-V) need both a new `TARGET_MAP` entry and a new Rust release target — coordinate with `packages-rs/cli/Cargo.toml` and `.github/workflows/cli-release.yml`.

---

## When you change `bin/ruleshub.js`

- Keep it minimal — every line is one more failure mode at the user's `ruleshub <args>` invocation. The current ~30 lines are a hard ceiling.
- No fallback "try to download the binary if it's missing" logic — the postinstall is the only download path. A failed postinstall should produce a clear error, not silent re-download.
