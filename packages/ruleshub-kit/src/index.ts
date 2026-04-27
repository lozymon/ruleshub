import { PackageManifestSchema } from "@ruleshub/types";
import type {
  PackageManifest,
  AssetType,
  SupportedTool,
} from "@ruleshub/types";
import { ZodError } from "zod";

export type { PackageManifest, AssetType, SupportedTool };
export {
  PackageManifestSchema,
  AssetTypeSchema,
  SupportedToolSchema,
  TOOL_LABELS,
  TOOL_INSTALL_PATHS,
} from "@ruleshub/types";

// ---- parseManifest --------------------------------------------------------

/**
 * Parse and validate a raw JSON value as a PackageManifest.
 * Throws ZodError on invalid input.
 */
export function parseManifest(json: unknown): PackageManifest {
  return PackageManifestSchema.parse(json);
}

// ---- validateManifest -----------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
}

/** Validate without throwing. Returns { valid, errors }. */
export function validateManifest(json: unknown): ValidationResult {
  const result = PackageManifestSchema.safeParse(json);
  if (result.success) return { valid: true, errors: [] };

  const errors = result.error.errors.map((e) => ({
    field: e.path.join(".") || "root",
    message: e.message,
  }));
  return { valid: false, errors };
}

// ---- buildManifest --------------------------------------------------------

type ManifestInput = Omit<PackageManifest, "tags" | "projectTypes"> &
  Partial<Pick<PackageManifest, "tags" | "projectTypes">>;

/**
 * Build a PackageManifest with sensible defaults and validate it.
 * Throws ZodError if the result is invalid.
 */
export function buildManifest(input: ManifestInput): PackageManifest {
  return PackageManifestSchema.parse({
    tags: [],
    projectTypes: [],
    ...input,
  });
}

// ---- getTargetFile --------------------------------------------------------

/**
 * Resolve the file path declared for a given tool in a manifest's targets map.
 * Returns undefined if the manifest doesn't target that tool.
 */
export function getTargetFile(
  manifest: PackageManifest,
  tool: SupportedTool,
): string | undefined {
  return manifest.targets?.[tool]?.file;
}

// ---- getIncludedPackages --------------------------------------------------

/**
 * Extract the list of included package names from a pack manifest.
 * Returns an empty array for non-pack manifests.
 */
export function getIncludedPackages(manifest: PackageManifest): string[] {
  if (manifest.type !== "pack") return [];
  return manifest.includes ?? [];
}

// ---- re-export ZodError for convenience ----------------------------------

export { ZodError };
