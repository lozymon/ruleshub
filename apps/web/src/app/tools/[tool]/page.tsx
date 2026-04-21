export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { searchPackages } from '@/lib/api/packages';
import { PackageCard } from '@/components/packages/package-card';
import { TOOL_LABELS, SupportedToolSchema, type SupportedTool } from '@ruleshub/types';
import { TOOL_COLORS } from '@/lib/tool-colors';
import { routes } from '@/lib/routes';

interface ToolPageProps {
  params: Promise<{ tool: string }>;
}

const TOOL_DESCRIPTIONS: Record<SupportedTool, string> = {
  'claude-code': 'Rules, commands, and workflows for Anthropic\'s Claude Code CLI.',
  'cursor':      'Rules and snippets for the Cursor AI editor.',
  'copilot':     'Instructions and snippets for GitHub Copilot.',
  'windsurf':    'Rules and configurations for the Windsurf editor.',
  'cline':       'Rules and prompts for the Cline VS Code extension.',
  'aider':       'Conventions and configurations for Aider.',
  'continue':    'Rules and configs for the Continue VS Code extension.',
};

export default async function ToolPage({ params }: ToolPageProps) {
  const { tool } = await params;

  const parsed = SupportedToolSchema.safeParse(tool);
  if (!parsed.success) notFound();

  const toolId = parsed.data as SupportedTool;
  const label = TOOL_LABELS[toolId];
  const color = TOOL_COLORS[toolId];
  const description = TOOL_DESCRIPTIONS[toolId];

  const { data: packages, total } = await searchPackages({ tool: toolId, limit: 48 }).catch(() => ({ data: [], total: 0 }));

  const allTools = Object.entries(TOOL_LABELS) as [SupportedTool, string][];

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-16">

      {/* Tool header */}
      <div className="border-b border-border py-10">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full" style={{ background: color }} />
          <h1 className="text-[28px] font-semibold tracking-[-0.02em]">{label}</h1>
        </div>
        <p className="mt-2 text-[14.5px] text-fg-muted">{description}</p>
        <p className="mt-1 font-mono text-[13px] text-fg-dim">
          {total.toLocaleString()} package{total !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Tool tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto pb-1">
        {allTools.map(([t, lbl]) => (
          <Link
            key={t}
            href={routes.tool(t)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
              t === toolId
                ? 'bg-bg-elev-2 text-foreground'
                : 'text-fg-muted hover:bg-bg-elev hover:text-foreground'
            }`}
          >
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: TOOL_COLORS[t] }} />
            {lbl}
          </Link>
        ))}
      </div>

      {/* Packages grid */}
      <div className="mt-6">
        {packages.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-border py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-bg-elev">
              <Package className="h-5 w-5 text-fg-dim" />
            </div>
            <h3 className="mb-1.5 text-[16px] font-medium">No packages yet</h3>
            <p className="mb-5 text-fg-dim">Be the first to publish a package for {label}.</p>
            <Link
              href={routes.publish}
              className="inline-flex h-[34px] items-center gap-1.5 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Publish a package
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
