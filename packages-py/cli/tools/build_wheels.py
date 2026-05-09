#!/usr/bin/env python3
"""Build platform-specific ruleshub wheels.

For each Rust release target, downloads the canonical archive from GitHub
Releases, extracts the binary into ``ruleshub/_bin/``, runs
``python -m build --wheel`` to produce a generic ``py3-none-any`` wheel,
and then re-tags the wheel with the matching pip platform tag using
``wheel tags``.

Output: 7 wheels in ``dist/``, one per supported platform.

    python tools/build_wheels.py --version 0.1.0-alpha.3

Requires: ``build`` and ``wheel`` packages (``pip install build wheel``).
"""

from __future__ import annotations

import argparse
import io
import shutil
import subprocess
import sys
import tarfile
import urllib.request
import zipfile
from pathlib import Path

PACKAGE_DIR = Path(__file__).resolve().parent.parent
BIN_DIR = PACKAGE_DIR / "ruleshub" / "_bin"

# (rust_target, wheel_platform_tag, binary_name, archive_extension)
TARGETS = [
    ("x86_64-unknown-linux-gnu",
     "manylinux_2_17_x86_64.manylinux2014_x86_64",
     "ruleshub", "tar.gz"),
    ("x86_64-unknown-linux-musl",
     "musllinux_1_1_x86_64",
     "ruleshub", "tar.gz"),
    ("aarch64-unknown-linux-gnu",
     "manylinux_2_17_aarch64.manylinux2014_aarch64",
     "ruleshub", "tar.gz"),
    ("aarch64-unknown-linux-musl",
     "musllinux_1_1_aarch64",
     "ruleshub", "tar.gz"),
    ("x86_64-apple-darwin",
     "macosx_10_12_x86_64",
     "ruleshub", "tar.gz"),
    ("aarch64-apple-darwin",
     "macosx_11_0_arm64",
     "ruleshub", "tar.gz"),
    ("x86_64-pc-windows-msvc",
     "win_amd64",
     "ruleshub.exe", "zip"),
]


def fetch_binary(version: str, target: str, bin_name: str, ext: str) -> bytes:
    archive = f"ruleshub-{version}-{target}.{ext}"
    url = (
        f"https://github.com/lozymon/ruleshub/releases/download/"
        f"cli-v{version}/{archive}"
    )
    print(f"  download: {url}")
    with urllib.request.urlopen(url) as r:
        archive_bytes = r.read()

    archive_root = f"ruleshub-{version}-{target}"
    if ext == "zip":
        with zipfile.ZipFile(io.BytesIO(archive_bytes)) as z:
            return z.read(f"{archive_root}/{bin_name}")
    with tarfile.open(fileobj=io.BytesIO(archive_bytes), mode="r:gz") as t:
        member = t.getmember(f"{archive_root}/{bin_name}")
        extracted = t.extractfile(member)
        if extracted is None:
            raise RuntimeError(f"could not extract {bin_name} from {archive}")
        return extracted.read()


def clean_bin_dir() -> None:
    for entry in BIN_DIR.iterdir():
        if entry.name == ".gitkeep":
            continue
        entry.unlink()


def build_generic_wheel(dist_dir: Path) -> Path:
    """Build a py3-none-any wheel; return its path."""
    # Wipe any previous build outputs
    for sub in ("build", "dist"):
        target = PACKAGE_DIR / sub
        if target.exists():
            shutil.rmtree(target)

    subprocess.run(
        [sys.executable, "-m", "build", "--wheel", "--outdir", str(dist_dir)],
        cwd=PACKAGE_DIR,
        check=True,
    )
    wheels = list(dist_dir.glob("ruleshub-*-py3-none-any.whl"))
    if len(wheels) != 1:
        raise RuntimeError(
            f"expected exactly one py3-none-any wheel, found {len(wheels)}: {wheels}"
        )
    return wheels[0]


def retag_wheel(generic_wheel: Path, platform_tag: str, dist_dir: Path) -> Path:
    """Re-tag the generic wheel with a platform tag using `wheel tags`.

    `wheel` may normalize compound platform tags (e.g. reorder
    ``manylinux_2_17_x86_64.manylinux2014_x86_64`` alphabetically), so
    we don't try to predict the resulting filename. Snapshot the dist
    directory before and after, and pick up whichever new wheel
    appeared.
    """
    before = set(dist_dir.glob("*.whl"))
    subprocess.run(
        [
            sys.executable, "-m", "wheel", "tags",
            "--platform-tag", platform_tag,
            "--remove",
            str(generic_wheel),
        ],
        cwd=dist_dir,
        check=True,
    )
    after = set(dist_dir.glob("*.whl"))
    new_wheels = after - before
    if len(new_wheels) != 1:
        raise RuntimeError(
            f"expected exactly one new wheel after retag, got: {sorted(new_wheels)}"
        )
    return new_wheels.pop()


def build_for(version: str, target: str, platform_tag: str,
              bin_name: str, ext: str, dist_dir: Path) -> Path:
    print(f"\n=== {target} -> {platform_tag} ===")

    clean_bin_dir()
    binary_bytes = fetch_binary(version, target, bin_name, ext)
    bin_path = BIN_DIR / bin_name
    bin_path.write_bytes(binary_bytes)
    bin_path.chmod(0o755)

    generic = build_generic_wheel(dist_dir)
    final = retag_wheel(generic, platform_tag, dist_dir)
    print(f"  ok: {final.name}")
    return final


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--version", required=True,
        help="binary version to package, e.g. 0.1.0-alpha.3",
    )
    parser.add_argument(
        "--dist-dir", default=str(PACKAGE_DIR / "dist"),
        help="output directory for wheels",
    )
    parser.add_argument(
        "--targets", nargs="*",
        help="restrict to these rust targets (default: all)",
    )
    args = parser.parse_args()

    dist_dir = Path(args.dist_dir).resolve()
    dist_dir.mkdir(parents=True, exist_ok=True)

    selected = TARGETS
    if args.targets:
        selected = [t for t in TARGETS if t[0] in set(args.targets)]
        unknown = set(args.targets) - {t[0] for t in TARGETS}
        if unknown:
            print(f"unknown targets: {', '.join(sorted(unknown))}", file=sys.stderr)
            return 2

    built = []
    for target, platform_tag, bin_name, ext in selected:
        built.append(
            build_for(args.version, target, platform_tag, bin_name, ext, dist_dir)
        )

    print(f"\ndone: {len(built)} wheel(s) in {dist_dir}")
    for w in built:
        print(f"  {w.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
