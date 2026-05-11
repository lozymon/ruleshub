import { z } from "zod";
import { SupportedToolSchema } from "./tools";

export const AssetTypeSchema = z.enum([
  "rule",
  "command",
  "workflow",
  "agent",
  "mcp-server",
  "pack",
  "skill",
]);

export type AssetType = z.infer<typeof AssetTypeSchema>;

export const TargetConfigSchema = z.object({
  // Path inside the package zip — generous cap, but bounded so a malicious
  // manifest can't ship a multi-megabyte string here.
  file: z.string().min(1).max(256),
});

export type TargetConfig = z.infer<typeof TargetConfigSchema>;

// Bound every user-provided list and string. Without these caps a publisher
// could submit a manifest with 100k tags or a multi-megabyte string and force
// the API + database to fan that out across the system. The numbers below are
// conservative — they leave room for legitimate manifests (the longest tag
// across the seed catalogue is ~24 chars) while making "ship a 1 MB JSON
// payload as `tags`" a parse-time rejection.
const TAG_RE = /^[a-z0-9][a-z0-9-]*$/;

export const PackageManifestSchema = z
  .object({
    name: z
      .string()
      .max(72)
      .regex(
        /^[a-z0-9_-]+\/[a-z0-9_-]+$/,
        "Must be in the format owner/package-name",
      ),
    version: z
      .string()
      .max(64)
      .regex(/^\d+\.\d+\.\d+/, "Must be a valid semver version"),
    type: AssetTypeSchema,
    description: z.string().min(1).max(200),
    tags: z
      .array(
        z
          .string()
          .min(1)
          .max(32)
          .regex(TAG_RE, "Tags must be lowercase alphanumerics or hyphens"),
      )
      .max(20)
      .default([]),
    projectTypes: z.array(z.string().min(1).max(32)).max(20).default([]),
    license: z.string().min(1).max(64),
    targets: z.record(SupportedToolSchema, TargetConfigSchema).optional(),
    includes: z.array(z.string().min(1).max(128)).max(100).optional(),
    changelog: z.string().max(5000).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.type === "pack" &&
      (!data.includes || data.includes.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Packs must have at least one item in `includes`",
        path: ["includes"],
      });
    }
    if (
      data.type !== "pack" &&
      (!data.targets || Object.keys(data.targets).length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Non-pack assets must have at least one target",
        path: ["targets"],
      });
    }
  });

export type PackageManifest = z.infer<typeof PackageManifestSchema>;
