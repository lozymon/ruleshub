# ruleshub (pip wrapper)

Python wrapper for the [RulesHub CLI](https://ruleshub.dev). Install via `pip` or `pipx` to get the canonical Rust binary on your `PATH` — no Node, no Composer, no manual download.

## Install

```bash
# recommended (isolated environment, on PATH)
pipx install ruleshub

# or via pip
pip install ruleshub
```

Then:

```bash
ruleshub --help
ruleshub install lozymon/nestjs-rules
ruleshub validate
```

## How it works

This package ships **platform-specific wheels** — when you run `pip install ruleshub`, pip downloads the wheel matching your OS + architecture and the wheel already contains the binary. No runtime download, no SHA256 negotiation, works offline after install.

The wheel for each platform is built by repackaging the canonical Rust binary from [GitHub Releases](https://github.com/lozymon/ruleshub/releases) — same bytes you'd get via `cargo install ruleshub`, `curl -fsSL https://ruleshub.dev/install.sh | sh`, or any other channel.

## Supported platforms

| OS / arch                   | pip wheel platform tag   |
| --------------------------- | ------------------------ |
| Linux x86_64 (glibc)        | `manylinux_2_17_x86_64`  |
| Linux x86_64 (musl, Alpine) | `musllinux_1_1_x86_64`   |
| Linux ARM64 (glibc)         | `manylinux_2_17_aarch64` |
| Linux ARM64 (musl)          | `musllinux_1_1_aarch64`  |
| macOS Intel                 | `macosx_10_12_x86_64`    |
| macOS Apple Silicon         | `macosx_11_0_arm64`      |
| Windows x86_64              | `win_amd64`              |

If pip can't find a matching wheel, install fails — there's intentionally no source distribution to fall back to (the Rust binary needs to be pre-built).

## Requirements

- Python 3.10+
- pip / pipx

## Other install paths

See the [installation guide](https://ruleshub.dev/docs/cli/binary) for native binary install (curl/iwr), Composer wrapper, npm (coming), and direct GitHub Releases download.

## License

MIT — same as the canonical CLI.
