"use client";

// Client component — needs clipboard API

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface BadgeSnippetsProps {
  versionUrl: string;
  downloadsUrl: string;
  version: string | null;
  downloads: string;
}

function PreviewBadge({
  label,
  value,
  valueBg,
}: {
  label: string;
  value: string;
  valueBg: string;
}) {
  return (
    <span className="inline-flex items-stretch overflow-hidden rounded font-sans text-[11px] leading-none">
      <span className="bg-[#e4e4e7] px-2 py-1 text-[#18181b] dark:bg-[#555] dark:text-white">
        {label}
      </span>
      <span className="px-2 py-1 text-white" style={{ background: valueBg }}>
        {value}
      </span>
    </span>
  );
}

function CopyLine({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="group flex items-center gap-1.5">
      <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-fg-muted">
        {text}
      </code>
      <button
        onClick={copy}
        className="shrink-0 rounded p-0.5 text-fg-dim opacity-0 transition-opacity group-hover:opacity-100"
        title="Copy"
      >
        {copied ? (
          <Check className="h-3 w-3 text-emerald-400" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
    </div>
  );
}

export function BadgeSnippets({
  versionUrl,
  downloadsUrl,
  version,
  downloads,
}: BadgeSnippetsProps) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-fg-dim uppercase tracking-[0.06em]">
        Markdown
      </p>
      <div className="rounded-md border border-border bg-bg-elev-2 px-3 py-2 space-y-1.5">
        <CopyLine text={`![version](${versionUrl})`} />
        <CopyLine text={`![downloads](${downloadsUrl})`} />
      </div>
      <p className="text-[11px] font-medium text-fg-dim uppercase tracking-[0.06em] pt-1">
        Preview
      </p>
      <div className="flex flex-wrap gap-2">
        <PreviewBadge
          label="ruleshub"
          value={version ? `v${version}` : "not found"}
          valueBg={version ? "#007ec6" : "#9f9f9f"}
        />
        <PreviewBadge label="downloads" value={downloads} valueBg="#4c1" />
      </div>
    </div>
  );
}
