import * as path from "path";
import type { Command } from "commander";
import { logger } from "../lib/logger";
import { validateManifest } from "../lib/validate";

interface ValidateOptions {
  json: boolean;
}

export function registerValidate(program: Command) {
  program
    .command("validate [dir]")
    .description(
      "Validate a ruleshub.json manifest in the current (or given) directory",
    )
    .option("--json", "Output results as JSON", false)
    .action(async (dir: string | undefined, opts: ValidateOptions) => {
      const cwd = dir ? path.resolve(dir) : process.cwd();
      const result = validateManifest(path.join(cwd, "ruleshub.json"));

      if (opts.json) {
        logger.json({ valid: result.valid, errors: result.errors });
        if (!result.valid) throw new Error("Validation failed");
        return;
      }

      if (result.valid && result.manifest) {
        logger.success(
          `Valid manifest: ${result.manifest.name}@${result.manifest.version}`,
        );
        return;
      }

      logger.error(`Found ${result.errors.length} error(s) in ruleshub.json:`);
      for (const e of result.errors) {
        logger.error(`  ${e.field}: ${e.message}`);
      }
      throw new Error("Validation failed");
    });
}
