# ruleshub (npm wrapper)

> Install, publish, and manage AI coding tool assets — Claude Code, Cursor, GitHub Copilot, Windsurf, Cline, Aider, Continue.

[npm](https://www.npmjs.com/package/ruleshub) wrapper for the [RulesHub CLI](https://ruleshub.dev). On install, downloads the canonical Rust binary from [GitHub Releases](https://github.com/lozymon/ruleshub/releases) and exec's it for every CLI invocation.

## Install

```bash
# one-shot, no global install
npx ruleshub <command>

# or install globally
npm install -g ruleshub
```

After install, the `ruleshub` command is on your `PATH`.

## Quick start

```bash
ruleshub --help                     # list commands
ruleshub search nestjs              # search the registry
ruleshub install lozymon/nestjs-rules --tool claude-code

ruleshub validate                   # check a ruleshub.json
ruleshub publish                    # publish the package in cwd
```

The `RULESHUB_TOKEN` env var (or `--token`) authenticates `publish`. Get a token at [ruleshub.dev/dashboard](https://ruleshub.dev/dashboard) → API Keys.

## Requirements

- Node 18 or later (for built-in `fetch`)
- A working `tar` command (Windows 10+, macOS, Linux all ship one)
- Network access to GitHub Releases at install time

## Supported platforms

| Platform            | Binary downloaded                               |
| ------------------- | ----------------------------------------------- |
| Linux x86_64        | `ruleshub-<version>-x86_64-unknown-linux-musl`  |
| Linux ARM64         | `ruleshub-<version>-aarch64-unknown-linux-musl` |
| macOS Intel         | `ruleshub-<version>-x86_64-apple-darwin`        |
| macOS Apple Silicon | `ruleshub-<version>-aarch64-apple-darwin`       |
| Windows x86_64      | `ruleshub-<version>-x86_64-pc-windows-msvc`     |

If your platform isn't listed, `npm install` succeeds quietly and the launcher prints a clear error when you run `ruleshub`. Use `pip install ruleshub`, `composer require ruleshub/cli`, or [download the binary directly](https://ruleshub.dev/docs/cli/binary) instead.

## How it works

`ruleshub`'s npm package is ~3 KB:

- `bin/ruleshub.js` — Node launcher (~30 lines): locates the binary at `bin/ruleshub-bin` and exec's it
- `tools/install.js` — postinstall script: downloads the matching binary from GitHub Releases, verifies SHA256, places it at `bin/ruleshub-bin`

Same canonical binary as `cargo install ruleshub`, `pip install ruleshub`, `composer require ruleshub/cli`, and `curl https://ruleshub.dev/install.sh | sh`. No drift across ecosystems by construction.

## `--ignore-scripts`

If you install with `npm install --ignore-scripts ruleshub`, the postinstall doesn't run and the binary isn't downloaded. The launcher prints a clear error:

```
ruleshub: native binary not found at .../bin/ruleshub-bin
  the postinstall script downloads it on install.
  did the install fail, or were scripts disabled (--ignore-scripts)?
  retry: npm rebuild ruleshub  (or reinstall with scripts enabled)
```

`npm rebuild ruleshub` re-runs the postinstall.

## Pinning a specific binary version

```bash
RULESHUB_VERSION=0.1.0 npm install ruleshub
```

The wrapper version (npm package) and binary version are intentionally aligned — `ruleshub@0.1.0` ships binary `0.1.0`. Override only if you need to test against a different binary.

## Other install paths

- [Native install script](https://ruleshub.dev/docs/cli/binary) — `curl | sh` / `iwr | iex`, no Node required
- [pip](https://pypi.org/project/ruleshub/) — `pipx install ruleshub`
- [Composer](https://packagist.org/packages/ruleshub/cli) — `composer require --dev ruleshub/cli`
- [crates.io](https://crates.io/crates/ruleshub) — `cargo install ruleshub`

## License

MIT — same as the canonical CLI.
