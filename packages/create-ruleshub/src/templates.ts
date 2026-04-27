import type { AssetType, SupportedTool } from "@ruleshub/types";

export const TOOL_TARGET_PATHS: Record<SupportedTool, string> = {
  "claude-code": "targets/claude-code/CLAUDE.md",
  cursor: "targets/cursor/.cursorrules",
  copilot: "targets/copilot/copilot-instructions.md",
  windsurf: "targets/windsurf/.windsurfrules",
  cline: "targets/cline/.clinerules",
  aider: "targets/aider/.aider.conf.yml",
  continue: "targets/continue/config.json",
};

const COMMAND_TOOL_TARGET_PATHS: Record<SupportedTool, string> = {
  "claude-code": "targets/claude-code/command.md",
  cursor: "targets/cursor/command.md",
  copilot: "targets/copilot/command.md",
  windsurf: "targets/windsurf/command.md",
  cline: "targets/cline/command.md",
  aider: "targets/aider/command.md",
  continue: "targets/continue/command.md",
};

export function targetPath(type: AssetType, tool: SupportedTool): string {
  if (type === "rule") return TOOL_TARGET_PATHS[tool];
  return COMMAND_TOOL_TARGET_PATHS[tool];
}

export function targetFileContent(
  type: AssetType,
  tool: SupportedTool,
  packageName: string,
): string {
  const shortName = packageName.split("/")[1] ?? packageName;

  if (type === "rule") {
    switch (tool) {
      case "claude-code":
        return `# ${shortName}\n\nAdd your Claude Code rules here.\n`;
      case "cursor":
        return `# ${shortName}\n\nAdd your Cursor rules here.\n`;
      case "copilot":
        return `# ${shortName}\n\nAdd your GitHub Copilot instructions here.\n`;
      case "windsurf":
        return `# ${shortName}\n\nAdd your Windsurf rules here.\n`;
      case "cline":
        return `# ${shortName}\n\nAdd your Cline rules here.\n`;
      case "aider":
        return `system_prompt: |\n  Add your Aider rules here.\n`;
      case "continue":
        return `{\n  "systemMessage": "Add your Continue rules here."\n}\n`;
    }
  }

  return `# ${shortName}\n\nDescribe what this ${type} does.\n\n## Usage\n\nAdd usage instructions here.\n`;
}

export function readmeContent(
  name: string,
  type: AssetType,
  description: string,
  tools: SupportedTool[],
): string {
  const toolList = tools.map((t) => `- \`${t}\``).join("\n");
  return `# ${name}

${description}

## Install

\`\`\`bash
npx ruleshub install ${name} --tool <tool>
\`\`\`

## Supported tools

${toolList}

## License

MIT
`;
}

export function packReadmeContent(name: string, description: string): string {
  return `# ${name}

${description}

## Install

\`\`\`bash
npx ruleshub install ${name} --tool <tool>
\`\`\`

## Contents

List the packages included in this pack here.

## License

MIT
`;
}
