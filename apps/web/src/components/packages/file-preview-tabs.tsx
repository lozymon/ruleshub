"use client"; // needs useState for active tab

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { PackageFilePreviewDto } from "@ruleshub/types";
import { TOOL_COLORS } from "@/lib/tool-colors";
import type { SupportedTool } from "@ruleshub/types";
import { cn } from "@/lib/utils";

interface FilePreviewTabsProps {
  previews: PackageFilePreviewDto[];
}

function fileName(path: string) {
  return path.split("/").pop() ?? path;
}

function fileDir(path: string) {
  const parts = path.split("/");
  return parts.length > 1 ? parts.slice(0, -1).join("/") + "/" : "";
}

export function FilePreviewTabs({ previews }: FilePreviewTabsProps) {
  const [active, setActive] = useState(0);

  if (previews.length === 0) {
    return (
      <p className="py-6 text-center text-[13px] text-fg-dim">
        No files found in this version.
      </p>
    );
  }

  const current = previews[active];
  const isMarkdown = current?.path.endsWith(".md");

  return (
    <div className="min-w-0">
      {/* File list tabs */}
      <div className="mb-3 flex flex-col gap-0.5 rounded-lg border border-border bg-bg-elev overflow-hidden">
        {previews.map((p, i) => {
          const color = p.tool
            ? (TOOL_COLORS[p.tool as SupportedTool] ?? "#888")
            : null;
          const isActive = i === active;
          const dir = fileDir(p.path);
          const name = fileName(p.path);

          return (
            <button
              key={p.path}
              onClick={() => setActive(i)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-left text-[12.5px] transition-colors border-b border-border last:border-0",
                isActive
                  ? "bg-[var(--rh-accent-tint)] text-foreground"
                  : "text-fg-muted hover:bg-bg-elev-2 hover:text-foreground",
              )}
            >
              {color ? (
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: color }}
                />
              ) : (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-border-strong" />
              )}
              <span className="font-mono">
                {dir && <span className="text-fg-dim">{dir}</span>}
                {name}
              </span>
              {p.isTarget && p.tool && (
                <span
                  className="ml-auto rounded-[3px] px-1.5 py-0.5 font-mono text-[10px]"
                  style={{
                    color: color ?? undefined,
                    background: `${color}18`,
                  }}
                >
                  {p.tool}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {current && (
        <>
          {/* File path + char count */}
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[12px] text-fg-dim">
              {current.path}
            </span>
            <span className="text-[11px] text-fg-dim">
              {current.content.length.toLocaleString()} chars
            </span>
          </div>

          {/* Content */}
          <div className="overflow-hidden rounded-lg border border-border bg-bg-code">
            {isMarkdown ? (
              <div className="prose-readme max-h-[520px] overflow-y-auto p-5">
                <ReactMarkdown>{current.content}</ReactMarkdown>
              </div>
            ) : (
              <pre className="max-h-[520px] overflow-auto p-4 font-mono text-[12.5px] leading-relaxed text-foreground">
                <code>{current.content}</code>
              </pre>
            )}
          </div>
        </>
      )}
    </div>
  );
}
