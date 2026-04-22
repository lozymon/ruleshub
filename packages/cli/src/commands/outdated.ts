import type { Command } from 'commander';
import { apiClient } from '../lib/api';
import { readLockFile } from '../lib/lockfile';
import { logger } from '../lib/logger';

interface OutdatedOptions {
  json: boolean;
}

export function registerOutdated(program: Command) {
  program
    .command('outdated')
    .description('Check installed packages for newer versions')
    .option('--json', 'Output as JSON', false)
    .action(async (opts: OutdatedOptions) => {
      const lock = readLockFile();
      const installed = Object.entries(lock.packages);

      if (installed.length === 0) {
        logger.info('No packages installed (no .ruleshub/installed.json found).');
        return;
      }

      const results = await Promise.all(
        installed.map(async ([name, entry]) => {
          const [namespace, packageName] = name.split('/');
          try {
            const pkg = await apiClient.getPackage(namespace, packageName);
            const latest = pkg.latestVersion?.version ?? entry.version;
            return { name, current: entry.version, latest, outdated: latest !== entry.version };
          } catch {
            return { name, current: entry.version, latest: null, outdated: false, error: true };
          }
        }),
      );

      const outdated = results.filter((r) => r.outdated);

      if (opts.json) {
        logger.json(results);
        return;
      }

      if (outdated.length === 0) {
        logger.success('All packages are up to date.');
        return;
      }

      logger.info(`${outdated.length} package${outdated.length > 1 ? 's' : ''} can be updated:\n`);
      for (const r of outdated) {
        console.log(`  ${r.name.padEnd(40)} ${r.current}  →  ${r.latest}`);
      }
      console.log('');
      logger.info('Run `ruleshub update` to update all, or `ruleshub update <name>` for one.');
    });
}
