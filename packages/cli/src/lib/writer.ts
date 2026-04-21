import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import { logger } from './logger';
import type { SupportedTool } from '@ruleshub/types';

export interface WriteResult {
  path: string;
  status: 'written' | 'skipped' | 'dry-run';
}

function getDestinationPath(tool: SupportedTool, assetType: string, sourceFile: string): string {
  const baseName = path.basename(sourceFile);

  switch (tool) {
    case 'claude-code':
      if (assetType === 'rule') return 'CLAUDE.md';
      if (assetType === 'command' || assetType === 'workflow')
        return path.join('.claude', 'commands', baseName);
      if (assetType === 'agent') return path.join('.claude', 'commands', baseName);
      return baseName;
    case 'cursor':
      if (assetType === 'rule') return '.cursorrules';
      return path.join('.cursor', 'rules', baseName);
    case 'copilot':
      return path.join('.github', 'copilot-instructions.md');
    case 'windsurf':
      return '.windsurfrules';
    case 'cline':
      return '.clinerules';
    case 'aider':
      return baseName === 'CONVENTIONS.md' ? 'CONVENTIONS.md' : '.aider.conf.yml';
    case 'continue':
      return path.join('.continue', baseName);
  }
}

export async function writeFromZip(
  zipBuffer: Buffer,
  sourceFile: string,
  tool: SupportedTool,
  assetType: string,
  opts: { dryRun: boolean; force: boolean; cwd?: string },
): Promise<WriteResult> {
  const cwd = opts.cwd ?? process.cwd();
  const destRelative = getDestinationPath(tool, assetType, sourceFile);
  const destAbsolute = path.resolve(cwd, destRelative);

  const zip = new AdmZip(zipBuffer);
  const entry = zip.getEntry(sourceFile);
  if (!entry) throw new Error(`File ${sourceFile} not found in package zip`);
  const content = entry.getData();

  if (opts.dryRun) {
    logger.dry(`Would write ${destRelative} (${content.length} bytes)`);
    return { path: destRelative, status: 'dry-run' };
  }

  const exists = fs.existsSync(destAbsolute);
  if (exists && !opts.force) {
    logger.warn(`${destRelative} already exists — use --force to overwrite`);
    return { path: destRelative, status: 'skipped' };
  }

  fs.mkdirSync(path.dirname(destAbsolute), { recursive: true });
  fs.writeFileSync(destAbsolute, content);
  logger.success(`Written ${destRelative}`);
  return { path: destRelative, status: 'written' };
}

export function previewZipEntry(zipBuffer: Buffer, sourceFile: string): string {
  const zip = new AdmZip(zipBuffer);
  const entry = zip.getEntry(sourceFile);
  if (!entry) throw new Error(`File ${sourceFile} not found in package zip`);
  return entry.getData().toString('utf-8');
}
