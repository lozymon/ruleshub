#!/usr/bin/env python3
"""Bump the CLI version across every ecosystem manifest.

The Rust CLI ships through Cargo, Composer, and PyPI — each with its
own version-string convention. Updating a release used to mean editing
four files in lockstep (and forgetting one is silent until the
release-time verify steps fail). This script does it in one shot.

Files updated:
  - packages-rs/cli/Cargo.toml          (semver)
  - packages-rs/cli/Cargo.lock          (auto, via cargo build)
  - packages-php/cli/src/Installer.php  (semver, BINARY_VERSION constant)
  - packages-py/cli/pyproject.toml      (PEP 440 normalized)
  - packages-py/cli/ruleshub/__init__.py (PEP 440 normalized)
  - packages/cli/package.json           (semver)
  - packages/cli/tools/install.js       (semver, BINARY_VERSION constant)

Usage:
    scripts/bump-cli-version.py 0.1.0
    scripts/bump-cli-version.py 0.2.0-alpha.1
    scripts/bump-cli-version.py 0.2.0-rc.2 --no-cargo-build

Versioning conventions:
    semver "0.1.0"          -> Python "0.1.0"     (no change)
    semver "0.1.0-alpha.3"  -> Python "0.1.0a3"
    semver "0.1.0-beta.1"   -> Python "0.1.0b1"
    semver "0.1.0-rc.2"     -> Python "0.1.0rc2"
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

CARGO_TOML = REPO_ROOT / "packages-rs/cli/Cargo.toml"
INSTALLER_PHP = REPO_ROOT / "packages-php/cli/src/Installer.php"
PYPROJECT_TOML = REPO_ROOT / "packages-py/cli/pyproject.toml"
PY_INIT = REPO_ROOT / "packages-py/cli/ruleshub/__init__.py"
NPM_PACKAGE_JSON = REPO_ROOT / "packages/cli/package.json"
NPM_INSTALL_JS = REPO_ROOT / "packages/cli/tools/install.js"


def to_pep440(semver: str) -> str:
    """Convert semver pre-release form to PEP 440.

    >>> to_pep440("0.1.0")
    '0.1.0'
    >>> to_pep440("0.1.0-alpha.3")
    '0.1.0a3'
    >>> to_pep440("0.1.0-beta.1")
    '0.1.0b1'
    >>> to_pep440("0.1.0-rc.2")
    '0.1.0rc2'
    """
    s = semver
    s = re.sub(r"-alpha\.(\d+)", r"a\1", s)
    s = re.sub(r"-beta\.(\d+)", r"b\1", s)
    s = re.sub(r"-rc\.(\d+)", r"rc\1", s)
    return s


def replace_in_file(path: Path, pattern: str, replacement: str) -> None:
    text = path.read_text()
    new_text, count = re.subn(pattern, replacement, text, flags=re.MULTILINE)
    if count == 0:
        raise RuntimeError(f"no match for pattern in {path}: {pattern!r}")
    if count > 1:
        raise RuntimeError(
            f"{count} matches for pattern in {path} (expected 1): {pattern!r}"
        )
    path.write_text(new_text)
    print(f"  updated {path.relative_to(REPO_ROOT)}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "version",
        help="new version, semver form (e.g. 0.1.0, 0.2.0-alpha.1)",
    )
    parser.add_argument(
        "--no-cargo-build",
        action="store_true",
        help="skip refreshing Cargo.lock (faster; you can run cargo build later)",
    )
    args = parser.parse_args()

    semver = args.version
    py_version = to_pep440(semver)

    if py_version != semver:
        print(f"bumping to {semver} (Python wheels: {py_version})")
    else:
        print(f"bumping to {semver}")

    replace_in_file(
        CARGO_TOML,
        r'^version = "[^"]+"',
        f'version = "{semver}"',
    )
    replace_in_file(
        INSTALLER_PHP,
        r"private const BINARY_VERSION = '[^']+';",
        f"private const BINARY_VERSION = '{semver}';",
    )
    replace_in_file(
        PYPROJECT_TOML,
        r'^version = "[^"]+"',
        f'version = "{py_version}"',
    )
    replace_in_file(
        PY_INIT,
        r'^__version__ = "[^"]+"',
        f'__version__ = "{py_version}"',
    )
    # npm package.json — uses semver, same as Cargo
    replace_in_file(
        NPM_PACKAGE_JSON,
        r'^  "version": "[^"]+"',
        f'  "version": "{semver}"',
    )
    # npm install.js — BINARY_VERSION constant the postinstall downloads
    replace_in_file(
        NPM_INSTALL_JS,
        r'const BINARY_VERSION = "[^"]+";',
        f'const BINARY_VERSION = "{semver}";',
    )

    if not args.no_cargo_build:
        print("\nrefreshing Cargo.lock...")
        subprocess.run(
            ["cargo", "build", "--quiet"],
            cwd=REPO_ROOT / "packages-rs/cli",
            check=True,
        )

    print()
    print("done. next steps:")
    print("  git add packages-rs/cli/Cargo.toml packages-rs/cli/Cargo.lock \\")
    print("          packages-php/cli/src/Installer.php \\")
    print("          packages-py/cli/pyproject.toml \\")
    print("          packages-py/cli/ruleshub/__init__.py \\")
    print("          packages/cli/package.json \\")
    print("          packages/cli/tools/install.js")
    print(f'  git commit -m "chore(cli): bump to {semver}"')
    print("  # PR develop -> main, merge")
    print(f"  # git tag cli-v{semver} origin/main && git push origin cli-v{semver}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
