"""Thin Python launcher: exec the native ruleshub binary.

Each platform-specific wheel ships exactly one binary at
``ruleshub/_bin/ruleshub`` (or ``ruleshub.exe`` on Windows). pip
installs the matching wheel for the user's platform; this launcher
locates the binary and forwards argv + exit code.
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


def _binary_path() -> Path:
    bin_dir = Path(__file__).parent / "_bin"
    name = "ruleshub.exe" if sys.platform == "win32" else "ruleshub"
    return bin_dir / name


def main() -> None:
    bin_path = _binary_path()
    if not bin_path.is_file():
        sys.stderr.write(
            f"ruleshub: native binary not found at {bin_path}\n"
            "  this wheel was likely installed without a platform-matching binary.\n"
            "  reinstall with: pip install --force-reinstall ruleshub\n"
        )
        sys.exit(127)

    args = [str(bin_path), *sys.argv[1:]]
    if sys.platform == "win32":
        # execv on Windows has unreliable argument quoting; subprocess is safer.
        sys.exit(subprocess.run(args).returncode)
    os.execv(str(bin_path), args)
