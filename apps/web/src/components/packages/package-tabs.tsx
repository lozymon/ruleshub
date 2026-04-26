"use client"; // needs useState for active tab

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  History,
  FileText,
  MessageSquare,
  Package,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { PackageDto, PackageVersionPreviewDto } from "@ruleshub/types";
import { FilePreviewTabs } from "./file-preview-tabs";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type TabId = "readme" | "versions" | "files" | "contents" | "comments";

const TYPE_ICONS: Record<string, string> = {
  rule: "📄",
  command: ">_",
  workflow: "⇢",
  agent: "◉",
  "mcp-server": "⬡",
  pack: "▣",
};

const ALL_TABS = [
  { id: "readme" as TabId, label: "README", Icon: BookOpen },
  { id: "contents" as TabId, label: "Contents", Icon: Package },
  { id: "versions" as TabId, label: "Versions", Icon: History },
  { id: "files" as TabId, label: "Files", Icon: FileText },
  { id: "comments" as TabId, label: "Comments", Icon: MessageSquare },
];

interface PackageTabsProps {
  namespace: string;
  name: string;
  pkg: PackageDto;
  preview: PackageVersionPreviewDto | null;
}

export function PackageTabs({
  namespace,
  name,
  pkg,
  preview,
}: PackageTabsProps) {
  const [active, setActive] = useState<TabId>("readme");

  const hasFiles = (preview?.previews.length ?? 0) > 0;
  const isPack = pkg.type === "pack";
  const readmeContent =
    preview?.previews.find((p) => p.path.toLowerCase() === "readme.md")
      ?.content ?? null;

  const visibleTabs = ALL_TABS.filter((t) => {
    if (t.id === "files" && !hasFiles) return false;
    if (t.id === "contents" && !isPack) return false;
    return true;
  });

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {visibleTabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={cn(
              "inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-[13px] font-medium transition-colors",
              active === id
                ? "border-primary text-foreground"
                : "border-transparent text-fg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* README */}
      {active === "readme" && (
        <div className="prose-readme py-6">
          {readmeContent ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {readmeContent}
            </ReactMarkdown>
          ) : (
            <>
              <h1>
                {namespace}/{name}
              </h1>
              <p>{pkg.description}</p>
              <h2>Installation</h2>
              <pre>
                <code>{`npx ruleshub install ${namespace}/${name}`}</code>
              </pre>
              <p>
                The CLI writes the appropriate files per detected tool — Claude
                Code receives a <code>CLAUDE.md</code> delta, Cursor gets{" "}
                <code>.cursor/rules/*.mdc</code>, and Copilot gets{" "}
                <code>.github/copilot-instructions.md</code>.
              </p>
              <h2>Supported tools</h2>
              <ul>
                {pkg.supportedTools.map((t) => (
                  <li key={t}>
                    <code>{t}</code>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Contents — packs only */}
      {active === "contents" && (
        <div className="py-6">
          {pkg.includes.length === 0 ? (
            <p className="text-[13px] text-fg-muted">No contents listed.</p>
          ) : (
            <div className="overflow-hidden rounded-[10px] border border-border bg-bg-elev">
              {pkg.includes.map((dep, i) => (
                <Link
                  key={dep.fullName}
                  href={routes.package(dep.fullName)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-bg-elev-2",
                    i < pkg.includes.length - 1 ? "border-b border-border" : "",
                  )}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-bg-elev-2 text-[12px] text-fg-muted">
                    {TYPE_ICONS[dep.type] ?? "□"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[13px] font-medium text-foreground">
                      {dep.fullName}
                    </div>
                    <div className="mt-0.5 truncate text-[12px] text-fg-muted">
                      {dep.description}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-[3px] border border-border bg-bg-elev-2 px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">
                      {dep.type}
                    </span>
                    <span className="font-mono text-[11px] text-fg-faint">
                      {dep.versionRange}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Files */}
      {active === "files" && preview && (
        <div className="py-6">
          <FilePreviewTabs previews={preview.previews} />
        </div>
      )}

      {/* Versions */}
      {active === "versions" && (
        <div className="py-6">
          {pkg.versions.length === 0 ? (
            <p className="text-[13px] text-fg-muted">
              No versions published yet.
            </p>
          ) : (
            <div className="overflow-hidden rounded-[10px] border border-border bg-bg-elev">
              {pkg.versions.map((v, i) => (
                <div
                  key={v.id}
                  className={
                    i < pkg.versions.length - 1 ? "border-b border-border" : ""
                  }
                >
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <span className="flex-1 font-mono text-[13px]">
                      {v.version}
                      {i === 0 && (
                        <span className="ml-2 rounded-[3px] border border-[var(--rh-accent-border)] bg-[var(--rh-accent-tint)] px-1.5 py-0.5 font-mono text-[10px] text-primary">
                          LATEST
                        </span>
                      )}
                      {v.yanked && (
                        <span className="ml-2 rounded-[3px] border border-destructive/40 bg-destructive/10 px-1.5 py-0.5 font-mono text-[10px] text-destructive">
                          YANKED
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-[12px] text-fg-dim">
                      {v.downloads.toLocaleString()} installs
                    </span>
                    <span className="text-[12px] text-fg-dim">
                      {new Date(v.publishedAt).toLocaleDateString()}
                    </span>
                    {i > 0 && pkg.versions[0] && (
                      <Link
                        href={routes.packageDiff(
                          `${namespace}/${name}`,
                          v.version,
                          pkg.versions[0].version,
                        )}
                        className="font-mono text-[11px] text-fg-dim transition-colors hover:text-primary"
                      >
                        diff →latest
                      </Link>
                    )}
                  </div>
                  {v.changelog && (
                    <details className="group px-4 pb-3">
                      <summary className="cursor-pointer list-none text-[12px] text-fg-dim hover:text-foreground">
                        <span className="inline-flex items-center gap-1">
                          <span className="transition-transform group-open:rotate-90">
                            ▶
                          </span>
                          Changelog
                        </span>
                      </summary>
                      <p className="mt-2 whitespace-pre-wrap rounded-md border border-border bg-bg-elev-2 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-fg-muted">
                        {v.changelog}
                      </p>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comments — placeholder */}
      {active === "comments" && (
        <div className="py-12 text-center text-[13px] text-fg-dim">
          Comments coming soon.
        </div>
      )}
    </div>
  );
}
