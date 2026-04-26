import { describe, it, expect } from "vitest";
import { PackageManifestSchema } from "./manifest";
import { SupportedToolSchema } from "./tools";

const validRule = {
  name: "lozymon/nestjs-rules",
  version: "1.0.0",
  type: "rule" as const,
  description: "NestJS coding rules for AI tools",
  license: "MIT",
  targets: {
    "claude-code": { file: "targets/claude-code/CLAUDE.md" },
  },
};

const validPack = {
  name: "lozymon/nestjs-pack",
  version: "1.0.0",
  type: "pack" as const,
  description: "Complete NestJS starter pack",
  license: "MIT",
  includes: ["lozymon/nestjs-rules@^1.0.0"],
};

describe("PackageManifestSchema", () => {
  it("accepts a valid rule manifest", () => {
    expect(PackageManifestSchema.safeParse(validRule).success).toBe(true);
  });

  it("accepts a valid pack manifest", () => {
    expect(PackageManifestSchema.safeParse(validPack).success).toBe(true);
  });

  it("accepts all supported asset types", () => {
    const types = [
      "rule",
      "command",
      "workflow",
      "agent",
      "mcp-server",
      "skill",
    ] as const;
    for (const type of types) {
      const result = PackageManifestSchema.safeParse({ ...validRule, type });
      expect(result.success, `type '${type}' should be valid`).toBe(true);
    }
  });

  it("accepts multiple targets", () => {
    const result = PackageManifestSchema.safeParse({
      ...validRule,
      targets: {
        "claude-code": { file: "targets/claude-code/CLAUDE.md" },
        cursor: { file: "targets/cursor/.cursorrules" },
        copilot: { file: "targets/copilot/copilot-instructions.md" },
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional tags and projectTypes", () => {
    const result = PackageManifestSchema.safeParse({
      ...validRule,
      tags: ["nestjs", "typescript"],
      projectTypes: ["nestjs", "node"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual(["nestjs", "typescript"]);
      expect(result.data.projectTypes).toEqual(["nestjs", "node"]);
    }
  });

  it("defaults tags and projectTypes to empty arrays", () => {
    const result = PackageManifestSchema.safeParse(validRule);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
      expect(result.data.projectTypes).toEqual([]);
    }
  });

  it("accepts a changelog field", () => {
    const result = PackageManifestSchema.safeParse({
      ...validRule,
      changelog: "Initial release",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid name format", () => {
    const result = PackageManifestSchema.safeParse({
      ...validRule,
      name: "no-slash",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a name with uppercase", () => {
    const result = PackageManifestSchema.safeParse({
      ...validRule,
      name: "Lozymon/nestjs-rules",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid version", () => {
    const result = PackageManifestSchema.safeParse({
      ...validRule,
      version: "not-semver",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-pack asset without targets", () => {
    const { targets: _, ...noTargets } = validRule;
    const result = PackageManifestSchema.safeParse(noTargets);
    expect(result.success).toBe(false);
  });

  it("rejects a pack without includes", () => {
    const { includes: _, ...noIncludes } = validPack;
    const result = PackageManifestSchema.safeParse(noIncludes);
    expect(result.success).toBe(false);
  });

  it("rejects a pack with an empty includes array", () => {
    const result = PackageManifestSchema.safeParse({
      ...validPack,
      includes: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown asset type", () => {
    const result = PackageManifestSchema.safeParse({
      ...validRule,
      type: "unknown",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a description over 200 characters", () => {
    const result = PackageManifestSchema.safeParse({
      ...validRule,
      description: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty description", () => {
    const result = PackageManifestSchema.safeParse({
      ...validRule,
      description: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty license", () => {
    const result = PackageManifestSchema.safeParse({
      ...validRule,
      license: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a changelog over 5000 characters", () => {
    const result = PackageManifestSchema.safeParse({
      ...validRule,
      changelog: "a".repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown tool in targets", () => {
    const result = PackageManifestSchema.safeParse({
      ...validRule,
      targets: { "not-a-tool": { file: "foo.md" } },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a target with an empty file path", () => {
    const result = PackageManifestSchema.safeParse({
      ...validRule,
      targets: { "claude-code": { file: "" } },
    });
    expect(result.success).toBe(false);
  });
});

describe("SupportedToolSchema", () => {
  it("accepts all valid tool keys", () => {
    const tools = [
      "claude-code",
      "cursor",
      "copilot",
      "windsurf",
      "cline",
      "aider",
      "continue",
    ];
    for (const tool of tools) {
      expect(
        SupportedToolSchema.safeParse(tool).success,
        `'${tool}' should be valid`,
      ).toBe(true);
    }
  });

  it("rejects unknown tool keys", () => {
    expect(SupportedToolSchema.safeParse("vscode").success).toBe(false);
    expect(SupportedToolSchema.safeParse("").success).toBe(false);
  });
});
