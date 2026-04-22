import { z } from 'zod';

export const SupportedToolSchema = z.enum([
  'claude-code',
  'cursor',
  'copilot',
  'windsurf',
  'cline',
  'aider',
  'continue',
]);

export type SupportedTool = z.infer<typeof SupportedToolSchema>;

export const TOOL_LABELS: Record<SupportedTool, string> = {
  'claude-code': 'Claude Code',
  'cursor': 'Cursor',
  'copilot': 'GitHub Copilot',
  'windsurf': 'Windsurf',
  'cline': 'Cline',
  'aider': 'Aider',
  'continue': 'Continue',
};

export const TOOL_INSTALL_PATHS: Record<SupportedTool, string[]> = {
  'claude-code': ['CLAUDE.md', '.claude/commands/', '.claude/settings.json'],
  'cursor': ['.cursorrules', '.cursor/rules/'],
  'copilot': ['.github/copilot-instructions.md'],
  'windsurf': ['.windsurfrules'],
  'cline': ['.clinerules'],
  'aider': ['.aider.conf.yml', 'CONVENTIONS.md'],
  'continue': ['.continue/'],
};
