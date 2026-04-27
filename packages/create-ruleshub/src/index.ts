#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import type { AssetType } from "@ruleshub/types";
import { AssetTypeSchema } from "@ruleshub/types";
import { runWizard } from "./wizard";
import { scaffold } from "./scaffold";

const program = new Command();

program
  .name("create-ruleshub")
  .description("Scaffold a RulesHub package")
  .version("0.1.0")
  .argument("[name]", "Package name in namespace/package-name format")
  .option(
    "-t, --template <type>",
    `Asset type (${AssetTypeSchema.options.join(", ")})`,
  )
  .option("--force", "Overwrite existing directory", false)
  .action(
    async (
      nameArg: string | undefined,
      opts: { template?: string; force: boolean },
    ) => {
      console.log(
        chalk.bold("\ncreate-ruleshub") + " — scaffold a RulesHub package\n",
      );

      let template: AssetType | undefined;
      if (opts.template) {
        const parsed = AssetTypeSchema.safeParse(opts.template);
        if (!parsed.success) {
          console.error(
            chalk.red("✗") +
              ` Unknown template "${opts.template}". Valid types: ${AssetTypeSchema.options.join(", ")}`,
          );
          process.exit(1);
        }
        template = parsed.data;
      }

      const answers = await runWizard(template);
      if (!answers) {
        console.log(chalk.yellow("\nCancelled."));
        process.exit(0);
      }

      if (nameArg) {
        const [ns, pkg] = nameArg.split("/");
        if (!ns || !pkg) {
          console.error(
            chalk.red("✗") +
              ' Name must be in "namespace/package-name" format.',
          );
          process.exit(1);
        }
        answers.name = nameArg;
      }

      const written = scaffold({
        ...answers,
        outDir: process.cwd(),
        force: opts.force,
      });

      const packageSlug = answers.name.split("/")[1];
      console.log(
        "\n" + chalk.green("✓") + ` Created ${chalk.bold(answers.name)}\n`,
      );
      for (const f of written) {
        console.log(`  ${chalk.dim(packageSlug + "/")}${f}`);
      }

      console.log(`
${chalk.bold("Next steps:")}

  ${chalk.cyan(`cd ${packageSlug}`)}
  ${chalk.cyan("npx ruleshub validate")}     ${chalk.dim("# check your manifest")}
  ${chalk.cyan("npx ruleshub publish")}      ${chalk.dim("# publish to RulesHub")}
`);
    },
  );

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(
    chalk.red("✗") + " " + (err instanceof Error ? err.message : String(err)),
  );
  process.exit(1);
});
