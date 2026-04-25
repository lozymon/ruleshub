"use client";

// Client component — needs clipboard API

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface BadgeSnippetsProps {
  versionUrl: string;
  downloadsUrl: string;
  fullName: string;
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
  fullName,
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={versionUrl} alt={`${fullName} version`} height={20} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={downloadsUrl} alt={`${fullName} downloads`} height={20} />
      </div>
    </div>
  );
}
