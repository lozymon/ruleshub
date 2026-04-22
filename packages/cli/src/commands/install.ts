import type { Command } from 'commander';
import { SupportedToolSchema, PackageManifestSchema } from '@ruleshub/types';
import { apiClient } from '../lib/api';
import { writeFromZip } from '../lib/writer';
import { recordInstall } from '../lib/lockfile';
import { logger } from '../lib/logger';

interface InstallOptions {
  tool?: string;
  version?: string;
  dryRun: boolean;
  force: boolean;
}

export function registerInstall(program: Command) {
  program
    .command('install <name>')
    .description('Install a package into the current project')
    .option('-t, --tool <tool>', 'Target AI tool (e.g. claude-code, cursor)')
    .option('-v, --version <version>', 'Specific version to install (default: latest)')
    .option('--dry-run', 'Preview what would be written without writing', false)
    .option('--force', 'Overwrite existing files without prompting', false)
    .action(async (name: string, opts: InstallOptions) => {
      const [namespace, packageName] = name.split('/');
      if (!namespace || !packageName) {
        throw new Error('Package name must be in the format owner/name');
      }

      logger.info(`Fetching ${name}…`);
      const pkg = await apiClient.getPackage(namespace, packageName);

      const targetVersion = opts.version ?? pkg.latestVersion?.version;
      if (!targetVersion) throw new Error(`No published versions found for ${name}`);

      const manifest = PackageManifestSchema.safeParse(pkg.latestVersion?.manifestJson);
      if (!manifest.success) throw new Error('Invalid package manifest from registry');

      const targets = manifest.data.targets ?? {};
      const availableTools = Object.keys(targets);

      if (availableTools.length === 0) {
        throw new Error(`${name} has no install targets`);
      }

      const rawTool = opts.tool ?? availableTools[0];
      const toolParsed = SupportedToolSchema.safeParse(rawTool);
      if (!toolParsed.success) {
        throw new Error(`Unknown tool: ${rawTool}. Available: ${availableTools.join(', ')}`);
      }
      const tool = toolParsed.data;

      if (!targets[tool]) {
        throw new Error(`${name} does not support ${tool}. Available: ${availableTools.join(', ')}`);
      }

      logger.info(`Downloading ${name}@${targetVersion} for ${tool}…`);
      const { url } = await apiClient.getDownloadUrl(namespace, packageName, targetVersion);
      const zipRes = await fetch(url);
      if (!zipRes.ok) throw new Error(`Download failed: ${zipRes.statusText}`);
      const zipBuffer = Buffer.from(await zipRes.arrayBuffer());

      const sourceFile = targets[tool].file;
      const result = await writeFromZip(zipBuffer, sourceFile, tool, manifest.data.type, {
        dryRun: opts.dryRun,
        force: opts.force,
      });

      if (!opts.dryRun) {
        recordInstall(name, {
          version: targetVersion,
          tool,
          files: [result.path],
          installedAt: new Date().toISOString(),
        });
        logger.success(`Installed ${name}@${targetVersion}`);
      }
    });
}
