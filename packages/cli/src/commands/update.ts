import type { Command } from 'commander';
import { PackageManifestSchema, SupportedToolSchema } from '@ruleshub/types';
import { apiClient } from '../lib/api';
import { readLockFile, recordInstall } from '../lib/lockfile';
import { writeFromZip } from '../lib/writer';
import { logger } from '../lib/logger';

interface UpdateOptions {
  dryRun: boolean;
  force: boolean;
}

export function registerUpdate(program: Command) {
  program
    .command('update [name]')
    .description('Update installed packages to their latest versions')
    .option('--dry-run', 'Preview updates without writing', false)
    .option('--force', 'Overwrite existing files without prompting', false)
    .action(async (name: string | undefined, opts: UpdateOptions) => {
      const lock = readLockFile();
      const entries = name
        ? Object.entries(lock.packages).filter(([n]) => n === name)
        : Object.entries(lock.packages);

      if (entries.length === 0) {
        logger.info(name ? `${name} is not installed.` : 'No packages installed.');
        return;
      }

      for (const [pkgName, installed] of entries) {
        const [namespace, packageName] = pkgName.split('/');

        logger.info(`Checking ${pkgName}…`);
        const pkg = await apiClient.getPackage(namespace, packageName);
        const latest = pkg.latestVersion?.version;

        if (!latest || latest === installed.version) {
          logger.info(`${pkgName} is already up to date (${installed.version})`);
          continue;
        }

        logger.info(`Updating ${pkgName}: ${installed.version} → ${latest}`);

        const manifest = PackageManifestSchema.safeParse(pkg.latestVersion?.manifestJson);
        if (!manifest.success) {
          logger.error(`Skipping ${pkgName}: invalid manifest from registry`);
          continue;
        }

        const targets = manifest.data.targets ?? {};
        const tool = SupportedToolSchema.safeParse(installed.tool).data;
        if (!tool || !targets[tool]) {
          logger.error(`Skipping ${pkgName}: tool ${installed.tool} no longer supported`);
          continue;
        }

        const { url } = await apiClient.getDownloadUrl(namespace, packageName, latest);
        const zipRes = await fetch(url);
        if (!zipRes.ok) throw new Error(`Download failed: ${zipRes.statusText}`);
        const zipBuffer = Buffer.from(await zipRes.arrayBuffer());

        const result = await writeFromZip(zipBuffer, targets[tool].file, tool, manifest.data.type, {
          dryRun: opts.dryRun,
          force: opts.force,
        });

        if (!opts.dryRun) {
          recordInstall(pkgName, {
            version: latest,
            tool,
            files: [result.path],
            installedAt: new Date().toISOString(),
          });
          logger.success(`Updated ${pkgName} to ${latest}`);
        }
      }
    });
}
