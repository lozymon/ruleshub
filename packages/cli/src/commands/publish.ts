import * as fs from "fs";
import * as path from "path";
import type { Command } from "commander";
import AdmZip from "adm-zip";
import { apiClient } from "../lib/api";
import { logger } from "../lib/logger";
import { validateManifest } from "../lib/validate";

interface PublishOptions {
  token?: string;
  dryRun: boolean;
}

export function registerPublish(program: Command) {
  program
    .command("publish")
    .description("Publish the package in the current directory")
    .option("--token <token>", "API token (or set RULESHUB_TOKEN env var)")
    .option("--dry-run", "Validate and preview without publishing", false)
    .action(async (opts: PublishOptions) => {
      const token = opts.token ?? process.env.RULESHUB_TOKEN;
      if (!token && !opts.dryRun) {
        throw new Error(
          "No auth token found. Pass --token <token> or set RULESHUB_TOKEN env var.\n" +
            "Get a token at https://ruleshub.dev/dashboard",
        );
      }

      const manifestPath = path.resolve(process.cwd(), "ruleshub.json");
      const result = validateManifest(manifestPath);

      if (!result.valid) {
        const lines = result.errors
          .map((e) => `  ${e.field}: ${e.message}`)
          .join("\n");
        throw new Error(`Invalid ruleshub.json:\n${lines}`);
      }

      const { name, version } = result.manifest!;
      logger.info(`Packaging ${name}@${version}…`);

      const raw = JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as Record<
        string,
        unknown
      >;

      const zip = new AdmZip();
      const ignored = new Set([
        ".git",
        "node_modules",
        ".DS_Store",
        "dist",
        ".turbo",
      ]);

      function addDir(dir: string, zipPath: string) {
        for (const entry of fs.readdirSync(dir)) {
          if (ignored.has(entry)) continue;
          const full = path.join(dir, entry);
          const rel = path.join(zipPath, entry);
          if (fs.statSync(full).isDirectory()) {
            addDir(full, rel);
          } else {
            zip.addLocalFile(
              full,
              path.dirname(rel) === "." ? "" : path.dirname(rel),
              path.basename(rel),
            );
          }
        }
      }

      addDir(process.cwd(), "");
      const zipBuffer = zip.toBuffer();

      logger.info(`Package size: ${(zipBuffer.length / 1024).toFixed(1)} KB`);

      if (zipBuffer.length > 5 * 1024 * 1024) {
        throw new Error("Package exceeds the 5 MB size limit");
      }

      if (opts.dryRun) {
        logger.dry(
          `Would publish ${name}@${version} (${(zipBuffer.length / 1024).toFixed(1)} KB)`,
        );
        return;
      }

      logger.info("Publishing…");
      await apiClient.publishPackage(zipBuffer, raw, token!);
      logger.success(`Published ${name}@${version}`);
      logger.info(`View at https://ruleshub.dev/packages/${name}`);
    });
}
