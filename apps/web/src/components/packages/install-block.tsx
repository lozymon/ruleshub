"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { SupportedTool } from "@ruleshub/types";

interface InstallBlockProps {
  namespace: string;
  name: string;
  firstTool: SupportedTool | null;
}

type TabKey = "npx" | "pnpm" | "bun" | "tool";

const TABS: { id: TabKey; label: string }[] = [
  { id: "npx", label: "npx" },
  { id: "pnpm", label: "pnpm" },
  { id: "bun", label: "bun" },
  { id: "tool", label: "--tool" },
];

export function InstallBlock({
  namespace,
  name,
  firstTool,
}: InstallBlockProps) {
  const [tab, setTab] = useState<TabKey>("npx");
  const [copied, setCopied] = useState(false);

  const base = `${namespace}/${name}`;
  const cmds: Record<TabKey, string> = {
    npx: `npx ruleshub install ${base}`,
    pnpm: `pnpm dlx ruleshub install ${base}`,
    bun: `bunx ruleshub install ${base}`,
    tool: `npx ruleshub install ${base}${firstTool ? ` --tool ${firstTool}` : ""}`,
  };

  const cmd = cmds[tab];

  function copy() {
    navigator.clipboard?.writeText(cmd).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function renderCmd() {
    return cmd.split(/(\s+)/).map((part, i) => {
      if (/^--/.test(part))
        return (
          <span key={i} className="text-primary">
            {part}
          </span>
        );
      if (part.includes("/"))
        return (
          <span key={i} className="text-primary">
            {part}
          </span>
        );
      return <span key={i}>{part}</span>;
    });
  }

  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-[var(--code-border)] bg-[var(--code-bg)]">
      {/* Tabs */}
      <div className="flex border-b border-[var(--code-border)] bg-[var(--code-header-bg)]">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`border-r border-[var(--code-border)] px-3.5 py-2 font-mono text-[12px] transition-colors ${
              tab === id
                ? "bg-[var(--code-bg)] text-[var(--code-fg)]"
                : "text-[var(--code-header-fg)] hover:text-[var(--code-fg)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Command */}
      <div className="flex items-center justify-between px-4 py-3.5">
        <span className="font-mono text-[13.5px] text-[var(--code-fg)]">
          <span className="text-[var(--code-tok-prompt)]">$ </span>
          {renderCmd()}
        </span>
        <button
          onClick={copy}
          className={`ml-4 inline-flex shrink-0 items-center gap-1.5 rounded-[5px] border px-2.5 py-1.5 font-sans text-[12px] transition-colors ${
            copied
              ? "border-success text-success"
              : "border-[var(--code-border)] text-[var(--code-header-fg)] hover:bg-[var(--code-header-hover)] hover:text-[var(--code-fg)]"
          }`}
        >
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
