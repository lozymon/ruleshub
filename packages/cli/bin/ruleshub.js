#!/usr/bin/env node

// Permanent Node launcher: locate and exec the native ruleshub binary.
//
// The native binary is placed at ../bin/ruleshub-bin (or .exe on
// Windows) by tools/install.js during postinstall. This file is what
// `bin` in package.json points at, so it stays Node-executable even
// after `npm install --ignore-scripts` runs (in which case it'll
// print a clear error message).

const { spawnSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

function binaryPath() {
  const isWindows = process.platform === "win32";
  const name = isWindows ? "ruleshub-bin.exe" : "ruleshub-bin";
  return path.join(__dirname, name);
}

const bin = binaryPath();
if (!fs.existsSync(bin)) {
  process.stderr.write(
    `ruleshub: native binary not found at ${bin}\n` +
      "  the postinstall script downloads it on install.\n" +
      "  did the install fail, or were scripts disabled (--ignore-scripts)?\n" +
      "  retry: npm rebuild ruleshub  (or reinstall with scripts enabled)\n",
  );
  process.exit(127);
}

const result = spawnSync(bin, process.argv.slice(2), { stdio: "inherit" });
if (result.error) {
  process.stderr.write(`ruleshub: ${result.error.message}\n`);
  process.exit(1);
}
process.exit(result.status ?? 0);
