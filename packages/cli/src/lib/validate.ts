import * as fs from "fs";
import * as path from "path";
import { PackageManifestSchema, type PackageManifest } from "@ruleshub/types";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  manifest?: PackageManifest;
  errors: ValidationError[];
}

function checkTargetFiles(
  cwd: string,
  targets: Record<string, { file: string }>,
): ValidationError[] {
  return Object.entries(targets).flatMap(([tool, cfg]) => {
    const full = path.resolve(cwd, cfg.file);
    if (!fs.existsSync(full)) {
      return [
        {
          field: `targets.${tool}.file`,
          message: `File not found: ${cfg.file}`,
        },
      ];
    }
    return [];
  });
}

export function validateManifest(manifestPath: string): ValidationResult {
  const cwd = path.dirname(manifestPath);

  if (!fs.existsSync(manifestPath)) {
    return {
      valid: false,
      errors: [
        {
          field: "(root)",
          message: `ruleshub.json not found at ${manifestPath}`,
        },
      ],
    };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  } catch {
    return {
      valid: false,
      errors: [{ field: "(root)", message: "ruleshub.json is not valid JSON" }],
    };
  }

  const parsed = PackageManifestSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      valid: false,
      errors: parsed.error.errors.map((e) => ({
        field: e.path.join(".") || "(root)",
        message: e.message,
      })),
    };
  }

  const fileErrors = parsed.data.targets
    ? checkTargetFiles(
        cwd,
        parsed.data.targets as Record<string, { file: string }>,
      )
    : [];

  if (fileErrors.length > 0) {
    return { valid: false, errors: fileErrors };
  }

  return { valid: true, manifest: parsed.data, errors: [] };
}
