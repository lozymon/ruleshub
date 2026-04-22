import type { SupportedTool } from '@ruleshub/types';

export const TOOL_COLORS: Record<SupportedTool, string> = {
  'claude-code': '#d97757',
  'cursor':      '#4a9eff',
  'copilot':     '#3fb950',
  'windsurf':    '#22d3ee',
  'cline':       '#a78bfa',
  'aider':       '#eab308',
  'continue':    '#8b8cf8',
};

export const TOOL_SHORT_LABELS: Record<SupportedTool, string> = {
  'claude-code': 'Claude',
  'cursor':      'Cursor',
  'copilot':     'Copilot',
  'windsurf':    'Windsurf',
  'cline':       'Cline',
  'aider':       'Aider',
  'continue':    'Continue',
};
