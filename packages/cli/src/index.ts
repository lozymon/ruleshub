#!/usr/bin/env node

import { Command } from "commander";
import { registerInstall } from "./commands/install";
import { registerPublish } from "./commands/publish";
import { registerOutdated } from "./commands/outdated";
import { registerUpdate } from "./commands/update";
import { registerValidate } from "./commands/validate";
import { logger } from "./lib/logger";

const program = new Command();

program
  .name("ruleshub")
  .description("The CLI for the RulesHub registry")
  .version("0.1.0")
  .option("-q, --quiet", "Suppress non-essential output", false)
  .hook("preAction", (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.quiet) logger.setQuiet(true);
  });

registerInstall(program);
registerPublish(program);
registerOutdated(program);
registerUpdate(program);
registerValidate(program);

program.parseAsync(process.argv).catch((err: unknown) => {
  logger.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
