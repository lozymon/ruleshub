import { execSync } from "child_process";
import prompts from "prompts";
import type { AssetType, SupportedTool } from "@ruleshub/types";
import { AssetTypeSchema, SupportedToolSchema } from "@ruleshub/types";

export interface WizardAnswers {
  name: string;
  type: AssetType;
  description: string;
  tools: SupportedTool[];
  license: string;
  tags: string[];
}

function inferNamespace(): string {
  try {
    const email = execSync("git config user.email", { stdio: "pipe" })
      .toString()
      .trim();
    const local = email.split("@")[0];
    return local.replace(/[^a-z0-9_-]/g, "-").toLowerCase();
  } catch {
    return "";
  }
}

const ASSET_TYPES = AssetTypeSchema.options.map((t) => ({
  title: t,
  value: t,
}));

const ALL_TOOLS = SupportedToolSchema.options.map((t) => ({
  title: t,
  value: t,
  selected: t === "claude-code",
}));

export async function runWizard(
  template?: AssetType,
): Promise<WizardAnswers | null> {
  const ns = inferNamespace();

  const answers = await prompts(
    [
      {
        type: "text",
        name: "namespace",
        message: "Your namespace (username or org slug)",
        initial: ns,
        validate: (v: string) =>
          /^[a-z0-9_-]+$/.test(v) || "Only lowercase letters, numbers, - and _",
      },
      {
        type: "text",
        name: "packageName",
        message: "Package name",
        validate: (v: string) =>
          /^[a-z0-9_-]+$/.test(v) || "Only lowercase letters, numbers, - and _",
      },
      {
        type: template ? null : "select",
        name: "type",
        message: "Asset type",
        choices: ASSET_TYPES,
        initial: 0,
      },
      {
        type: "text",
        name: "description",
        message: "Short description (max 200 chars)",
        validate: (v: string) =>
          (v.length > 0 && v.length <= 200) || "Required, max 200 characters",
      },
      {
        type: (prev: unknown, values: Record<string, unknown>) =>
          values.type === "pack" || template === "pack" ? null : "multiselect",
        name: "tools",
        message: "Target tools",
        choices: ALL_TOOLS,
        min: 1,
        hint: "Space to toggle, Enter to confirm",
      },
      {
        type: "text",
        name: "license",
        message: "License",
        initial: "MIT",
      },
      {
        type: "text",
        name: "tags",
        message: "Tags (comma-separated, optional)",
        initial: "",
      },
    ],
    {
      onCancel: () => {
        return false;
      },
    },
  );

  if (!answers.namespace || !answers.packageName || !answers.description) {
    return null;
  }

  const type: AssetType = template ?? (answers.type as AssetType);
  const tools: SupportedTool[] =
    type === "pack" ? [] : ((answers.tools as SupportedTool[]) ?? []);
  const tags: string[] = answers.tags
    ? (answers.tags as string)
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean)
    : [];

  return {
    name: `${answers.namespace as string}/${answers.packageName as string}`,
    type,
    description: answers.description as string,
    tools,
    license: (answers.license as string) || "MIT",
    tags,
  };
}
