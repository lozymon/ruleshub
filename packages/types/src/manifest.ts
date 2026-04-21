import { z } from 'zod';
import { SupportedToolSchema } from './tools';

export const AssetTypeSchema = z.enum([
  'rule',
  'command',
  'workflow',
  'agent',
  'mcp-server',
  'pack',
]);

export type AssetType = z.infer<typeof AssetTypeSchema>;

export const TargetConfigSchema = z.object({
  file: z.string().min(1),
});

export type TargetConfig = z.infer<typeof TargetConfigSchema>;

export const PackageManifestSchema = z.object({
  name: z
    .string()
    .regex(/^[a-z0-9_-]+\/[a-z0-9_-]+$/, 'Must be in the format owner/package-name'),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+/, 'Must be a valid semver version'),
  type: AssetTypeSchema,
  description: z.string().min(1).max(200),
  tags: z.array(z.string()).default([]),
  projectTypes: z.array(z.string()).default([]),
  license: z.string().min(1),
  targets: z.record(SupportedToolSchema, TargetConfigSchema).optional(),
  includes: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'pack' && (!data.includes || data.includes.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Packs must have at least one item in `includes`',
      path: ['includes'],
    });
  }
  if (data.type !== 'pack' && (!data.targets || Object.keys(data.targets).length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Non-pack assets must have at least one target',
      path: ['targets'],
    });
  }
});

export type PackageManifest = z.infer<typeof PackageManifestSchema>;
