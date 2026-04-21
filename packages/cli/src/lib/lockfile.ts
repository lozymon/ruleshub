import * as fs from 'fs';
import * as path from 'path';
import type { SupportedTool } from '@ruleshub/types';

const LOCK_PATH = '.ruleshub/installed.json';

export interface InstalledEntry {
  version: string;
  tool: SupportedTool;
  files: string[];
  installedAt: string;
}

export interface LockFile {
  packages: Record<string, InstalledEntry>;
}

export function readLockFile(cwd = process.cwd()): LockFile {
  const file = path.resolve(cwd, LOCK_PATH);
  if (!fs.existsSync(file)) return { packages: {} };
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as LockFile;
  } catch {
    return { packages: {} };
  }
}

export function writeLockFile(lock: LockFile, cwd = process.cwd()): void {
  const file = path.resolve(cwd, LOCK_PATH);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(lock, null, 2) + '\n');
}

export function recordInstall(
  name: string,
  entry: InstalledEntry,
  cwd = process.cwd(),
): void {
  const lock = readLockFile(cwd);
  lock.packages[name] = entry;
  writeLockFile(lock, cwd);
}

export function removeInstall(name: string, cwd = process.cwd()): void {
  const lock = readLockFile(cwd);
  delete lock.packages[name];
  writeLockFile(lock, cwd);
}
