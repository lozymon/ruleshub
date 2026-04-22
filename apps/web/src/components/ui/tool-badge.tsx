import type { SupportedTool } from '@ruleshub/types';
import { TOOL_COLORS, TOOL_SHORT_LABELS } from '@/lib/tool-colors';

interface ToolBadgeProps {
  tool: SupportedTool;
}

export function ToolBadge({ tool }: ToolBadgeProps) {
  const color = TOOL_COLORS[tool];
  const label = TOOL_SHORT_LABELS[tool];

  return (
    <span className="inline-flex items-center gap-1.5 rounded-[4px] border border-border bg-bg-elev-2 px-[7px] py-[3px] font-mono text-[11px] font-medium text-fg-muted">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
