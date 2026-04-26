"use client"; // needs useState for active tab

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { PackageFilePreviewDto } from "@ruleshub/types";
import { TOOL_COLORS } from "@/lib/tool-colors";
import type { SupportedTool } from "@ruleshub/types";

interface FilePreviewTabsProps {
  previews: PackageFilePreviewDto[];
}

export function FilePreviewTabs({ previews }: FilePreviewTabsProps) {
  const [active, setActive] = useState(0);

  if (previews.length === 0) {
    return (
      <p className="py-6 text-center text-[13px] text-fg-dim">
        No file targets found for this version.
      </p>
    );
  }

  const current = previews[active];
  const isMarkdown = current?.path.endsWith(".md");

  return (
    <div className="min-w-0">
      {/* Tool tabs */}
      {previews.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {previews.map((p, i) => {
            const color = TOOL_COLORS[p.tool as SupportedTool] ?? "#888";
            const isActive = i === active;
            return (
              <button
                key={p.tool}
                onClick={() => setActive(i)}
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors"
                style={
                  isActive
                    ? { borderColor: color, background: `${color}18`, color }
                    : {
                        borderColor: "var(--border-strong)",
                        color: "var(--fg-muted)",
                      }
                }
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: color }}
                />
                {p.tool}
              </button>
            );
          })}
        </div>
      )}

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
