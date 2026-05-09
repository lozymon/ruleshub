# RulesHub CLI

> Install, publish, and manage AI coding tool assets — Claude Code, Cursor, GitHub Copilot, Windsurf, Cline, Aider, Continue.

The canonical Rust binary for [RulesHub](https://ruleshub.dev). One binary, distributed through several channels — every install path gives you the same `ruleshub` executable.

## Install

```sh
# macOS / Linux — auto-detects platform, verifies SHA256, installs to ~/.local/bin
curl -fsSL https://ruleshub.dev/install.sh | sh

# Windows (PowerShell)
iwr -useb https://ruleshub.dev/install.ps1 | iex

# Via Cargo (Rust developers)
cargo install ruleshub

# Via npm
npm install -g ruleshub
```

See the [installation guide](https://ruleshub.dev/docs/cli/binary) for the full list of install methods, including manual GitHub Releases downloads, Homebrew (planned), and per-ecosystem wrappers (Composer, pip).

## Quick start

```sh
ruleshub --help                     # list commands

ruleshub search nestjs              # search the registry
ruleshub install lozymon/nestjs-rules --tool claude-code

ruleshub validate                   # check a ruleshub.json
ruleshub publish                    # publish the package in cwd

ruleshub outdated                   # list installed packages with updates
ruleshub update                     # update them all
```

The `RULESHUB_TOKEN` env var (or `--token`) authenticates `publish`. Get one at [ruleshub.dev/dashboard](https://ruleshub.dev/dashboard) → API Keys.

## Supported AI tools

| Tool           | Install paths written               |
| -------------- | ----------------------------------- |
| Claude Code    | `CLAUDE.md`, `.claude/commands/`    |
| Cursor         | `.cursorrules`, `.cursor/rules/`    |
| GitHub Copilot | `.github/copilot-instructions.md`   |
| Windsurf       | `.windsurfrules`                    |
| Cline          | `.clinerules`                       |
| Aider          | `.aider.conf.yml`, `CONVENTIONS.md` |
| Continue       | `.continue/`                        |

`--tool <name>` selects the target; defaults to `claude-code`.

## Docs

- [CLI overview](https://ruleshub.dev/docs/cli/overview)
- [Manifest reference](https://ruleshub.dev/docs/publishing/manifest-reference)
- [Architecture (binary-plus-wrappers model)](https://ruleshub.dev/docs/contributing/cli-architecture)
- [Source on GitHub](https://github.com/lozymon/ruleshub/tree/main/packages-rs/cli)

## License

MIT
