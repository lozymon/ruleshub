"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FileText,
  Terminal,
  GitBranch,
  Bot,
  Plug,
  Package,
  Wand2,
  Flame,
  Clock,
  Star,
  Download,
  Shield,
} from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.12-1.47-1.12-1.47-.91-.62.07-.61.07-.61 1.01.07 1.54 1.04 1.54 1.04.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.28.1-2.66 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.41.1 2.66.64.7 1.03 1.59 1.03 2.68 0 3.84-2.35 4.68-4.58 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
    </svg>
  );
}
import type { PackageSearchParams, AssetType } from "@ruleshub/types";
import { cn } from "@/lib/utils";

const ASSET_TYPES: { id: AssetType; label: string; Icon: React.ElementType }[] =
  [
    { id: "rule", label: "Rules", Icon: FileText },
    { id: "skill", label: "Skills", Icon: Wand2 },
    { id: "command", label: "Commands", Icon: Terminal },
    { id: "workflow", label: "Workflows", Icon: GitBranch },
    { id: "agent", label: "Agents", Icon: Bot },
    { id: "mcp-server", label: "MCP Servers", Icon: Plug },
    { id: "pack", label: "Packs", Icon: Package },
  ];

const SORT_OPTIONS = [
  { id: "trending", label: "Trending", Icon: Flame },
  { id: "newest", label: "Newest", Icon: Clock },
  { id: "stars", label: "Most stars", Icon: Star },
  { id: "downloads", label: "Most downloads", Icon: Download },
] as const;

interface BrowseFiltersProps {
  current: PackageSearchParams & { sort?: string };
  total: number;
  typeCounts: Record<AssetType, number>;
}

export function BrowseFilters({
  current,
  total,
  typeCounts,
}: BrowseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  function update(key: string, value: string | null | undefined) {
    const params = new URLSearchParams(
      Object.entries(current)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)]),
    );
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const currentType = current.type ?? "all";
  const currentSort = (current as { sort?: string }).sort ?? "trending";

  const filterBtn = (active: boolean) =>
    cn(
      "flex w-full items-center gap-2 rounded-[4px] px-2 py-1.5 text-[13px] text-left transition-colors",
      active
        ? "bg-bg-elev text-foreground"
        : "text-fg-muted hover:bg-bg-elev hover:text-foreground",
    );

  return (
    <div className="space-y-6">
      {/* Asset type */}
      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
          Asset type
        </div>
        <button
          className={filterBtn(currentType === "all")}
          onClick={() => update("type", undefined)}
        >
          All types
          <span className="ml-auto font-mono text-[11px] text-fg-faint">
            {total}
          </span>
        </button>
        {ASSET_TYPES.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={filterBtn(currentType === id)}
            onClick={() => update("type", id)}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
            <span className="ml-auto font-mono text-[11px] text-fg-faint">
              {typeCounts[id] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Sort by */}
      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
          Sort by
        </div>
        {SORT_OPTIONS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={filterBtn(currentSort === id)}
            onClick={() => update("sort", id)}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* Community */}
      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
          Community
        </div>
        <button className={filterBtn(false)}>
          <Shield className="h-3.5 w-3.5 shrink-0" />
          Verified only
        </button>
        <button className={filterBtn(false)}>
          <GithubIcon className="h-3.5 w-3.5 shrink-0" />
          Open source
        </button>
      </div>
    </div>
  );
}
