#!/usr/bin/env node
// Regenerate `packages-rs/cli/schema/ruleshub.schema.json` from the live Zod
// schema in `packages/types/src/manifest.ts`. The Rust CLI bakes this JSON
// into the binary via `include_str!` so `validate` and `publish` no longer
// require network access (see M12 in docs/audit.md). Run this from the
// repo's apps/web/ directory so pnpm can resolve the workspace package:
//
//   cd apps/web && node ../../packages-rs/cli/schema/regen.mjs > \
//     ../../packages-rs/cli/schema/ruleshub.schema.json
//
// Commit any diff alongside the manifest.ts change that triggered it.

import { zodToJsonSchema } from "zod-to-json-schema";
import { PackageManifestSchema } from "@ruleshub/types";

const schema = zodToJsonSchema(PackageManifestSchema, {
  name: "PackageManifest",
  $refStrategy: "none",
  definitionPath: "$defs",
});

process.stdout.write(
  JSON.stringify(
    {
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "https://ruleshub.dev/schema/ruleshub.json",
      title: "RulesHub Package Manifest",
      description:
        "Schema for ruleshub.json — the manifest file for RulesHub packages",
      ...schema,
    },
    null,
    2,
  ),
);
