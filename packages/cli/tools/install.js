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
const { spawnSync } = require("node:child_process");

const REPO = "lozymon/ruleshub";
const BINARY_VERSION = "0.1.3";

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

function extract(archivePath, destDir, ext) {
  // Windows: tar.exe's libarchive zip support is patchy across the
  // various tar.exe versions Microsoft has shipped. Use PowerShell's
  // Expand-Archive instead — works on every Windows 10+ runner.
  // *nix: tar -xzf is rock solid for tar.gz everywhere.
  if (process.platform === "win32" && ext === "zip") {
    const result = spawnSync(
      "powershell",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `Expand-Archive -LiteralPath '${archivePath.replace(/'/g, "''")}' -DestinationPath '${destDir.replace(/'/g, "''")}' -Force`,
      ],
      { encoding: "utf8" },
    );
    if (result.status !== 0) {
      throw new Error(
        `Expand-Archive failed (rc=${result.status}): ${result.stderr || result.stdout}`,
      );
    }
    return;
  }
  const result = spawnSync("tar", ["-xzf", archivePath], {
    cwd: destDir,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(
      `tar extraction failed (rc=${result.status}): ${result.stderr || result.stdout}`,
    );
  }
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

    extract(archivePath, tmpDir, ext);

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
