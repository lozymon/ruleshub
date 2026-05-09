#!/usr/bin/env node

// Postinstall script: download the matching ruleshub binary from
// GitHub Releases, verify its SHA256 against the published SHA256SUMS,
// and place it at ../bin/ruleshub-bin (or .exe on Windows).
//
// Errors don't propagate (exit 0) — failing here would abort the
// user's whole `npm install`. The launcher (bin/ruleshub.js) prints
// a helpful error if the binary isn't there at runtime.

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const os = require("node:os");
const { execSync } = require("node:child_process");

const REPO = "lozymon/ruleshub";
const BINARY_VERSION = "0.1.0";

const TARGET_MAP = {
  "linux-x64": "x86_64-unknown-linux-musl",
  "linux-arm64": "aarch64-unknown-linux-musl",
  "darwin-x64": "x86_64-apple-darwin",
  "darwin-arm64": "aarch64-apple-darwin",
  "win32-x64": "x86_64-pc-windows-msvc",
};

function detectTarget() {
  const key = `${process.platform}-${process.arch}`;
  return TARGET_MAP[key];
}

async function fetchBytes(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch failed (${res.status}) for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch failed (${res.status}) for ${url}`);
  return res.text();
}

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

async function run() {
  const target = detectTarget();
  if (!target) {
    process.stderr.write(
      `ruleshub: unsupported platform ${process.platform}-${process.arch}\n` +
        `  supported: ${Object.keys(TARGET_MAP).join(", ")}\n`,
    );
    return; // exit 0 — let the launcher report the missing binary
  }

  const isWindows = process.platform === "win32";
  const binName = isWindows ? "ruleshub.exe" : "ruleshub";
  const ext = isWindows ? "zip" : "tar.gz";

  const version = process.env.RULESHUB_VERSION || BINARY_VERSION;
  const archive = `ruleshub-${version}-${target}.${ext}`;
  const base = `https://github.com/${REPO}/releases/download/cli-v${version}`;

  process.stdout.write(`ruleshub: installing v${version} for ${target}...\n`);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ruleshub-"));
  try {
    process.stdout.write(`  download: ${base}/${archive}\n`);
    const archiveBytes = await fetchBytes(`${base}/${archive}`);

    const sumsText = await fetchText(`${base}/SHA256SUMS`);
    const sumsLine = sumsText
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.endsWith(archive));
    if (!sumsLine) throw new Error(`no checksum found for ${archive}`);
    const expected = sumsLine.split(/\s+/)[0];
    const actual = sha256(archiveBytes);
    if (actual !== expected) {
      throw new Error(`checksum mismatch for ${archive}`);
    }

    const archivePath = path.join(tmpDir, archive);
    fs.writeFileSync(archivePath, archiveBytes);

    // tar handles tar.gz on unix and zip on Windows 10+ (libarchive-based)
    const flags = ext === "zip" ? "-xf" : "-xzf";
    execSync(`tar ${flags} "${archivePath}"`, { cwd: tmpDir });

    const extractedBin = path.join(
      tmpDir,
      `ruleshub-${version}-${target}`,
      binName,
    );
    if (!fs.existsSync(extractedBin)) {
      throw new Error(`expected binary not found: ${extractedBin}`);
    }

    const binDir = path.join(__dirname, "..", "bin");
    fs.mkdirSync(binDir, { recursive: true });
    const dest = path.join(
      binDir,
      isWindows ? "ruleshub-bin.exe" : "ruleshub-bin",
    );
    fs.copyFileSync(extractedBin, dest);
    fs.chmodSync(dest, 0o755);

    process.stdout.write(`ruleshub: installed v${version} at ${dest}\n`);
  } catch (err) {
    process.stderr.write(`ruleshub: install failed: ${err.message}\n`);
    process.stderr.write("  the launcher will print an error if executed.\n");
    process.stderr.write("  retry: npm rebuild ruleshub\n");
    // Don't propagate — keeps `npm install` from aborting on a transient blip.
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

run();
