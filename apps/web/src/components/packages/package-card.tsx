import Link from "next/link";
import { Star, Download } from "lucide-react";
import { routes } from "@/lib/routes";
import { ToolBadge } from "@/components/ui/tool-badge";
import { QualityBadge } from "@/components/ui/quality-badge";
import type { PackageDto, PackageSummaryDto } from "@ruleshub/types";

const TYPE_ICONS: Record<string, string> = {
  rule: "📄",
  command: ">_",
  workflow: "⇢",
  agent: "◉",
  mcp: "⬡",
  pack: "▣",
};

function packContentsSummary(includes: PackageSummaryDto[]): string {
  const counts: Record<string, number> = {};
  for (const item of includes) {
    counts[item.type] = (counts[item.type] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([type, n]) => `${n} ${n === 1 ? type : type + "s"}`)
    .join(" · ");
}

interface PackageCardProps {
  pkg: PackageDto;
}

export function PackageCard({ pkg }: PackageCardProps) {
  const updatedAt = new Date(pkg.updatedAt);
  const now = Date.now();
  const diffMs = now - updatedAt.getTime();
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  const timeAgo =
    diffHours < 1
      ? "just now"
      : diffHours < 24
        ? `${diffHours}h ago`
        : diffDays < 7
          ? `${diffDays}d ago`
          : `${Math.floor(diffDays / 7)}w ago`;

  const downloads =
    pkg.totalDownloads >= 1_000_000
      ? `${(pkg.totalDownloads / 1_000_000).toFixed(1)}M`
      : pkg.totalDownloads >= 1_000
        ? `${(pkg.totalDownloads / 1_000).toFixed(1)}k`
        : String(pkg.totalDownloads);

  return (
    <Link href={routes.package(pkg.fullName)} className="block">
      <div className="group flex cursor-pointer flex-col gap-3 rounded-[10px] border border-border bg-bg-elev p-[18px] transition-all duration-[180ms] ease-out hover:-translate-y-px hover:border-border-hover hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6),0_0_0_1px_var(--border-hover)]">
        {/* Header */}
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-bg-elev-2 text-[13px] text-fg-muted">
            {TYPE_ICONS[pkg.type] ?? "□"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[14px] font-medium leading-snug tracking-[-0.01em]">
              <span className="text-fg-dim">{pkg.namespace}</span>
              <span className="text-fg-faint">/</span>
              <span className="text-foreground">{pkg.name}</span>
              {pkg.owner.verified && (
                <span
                  className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground"
                  title="Verified publisher"
                >
                  ✓
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="rounded-[3px] border border-border bg-bg-elev-2 px-1.5 py-0.5 font-mono text-[10.5px] font-medium lowercase text-fg-muted">
                {pkg.type}
              </span>
              {pkg.type === "pack" && pkg.includes.length > 0 && (
                <span className="font-mono text-[10.5px] text-fg-faint">
                  {packContentsSummary(pkg.includes)}
                </span>
              )}
              <span className="font-mono text-[11.5px] text-fg-faint">
                {timeAgo}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="line-clamp-2 min-h-[2.6em] text-[13px] leading-relaxed text-fg-muted">
          {pkg.description || "No description provided."}
        </p>

        {/* Tool badges */}
        <div className="flex flex-wrap gap-1.5">
          {pkg.supportedTools.slice(0, 4).map((tool) => (
            <ToolBadge key={tool} tool={tool} />
          ))}
          {pkg.supportedTools.length > 4 && (
            <span className="inline-flex items-center rounded-[4px] border border-border bg-bg-elev-2 px-[7px] py-[3px] font-mono text-[11px] font-medium text-fg-muted">
              +{pkg.supportedTools.length - 4}
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="mt-auto flex items-center gap-3.5 border-t border-border pt-2.5 font-mono text-[12px] text-fg-dim">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3 w-3" />
            {pkg.stars.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1">
            <Download className="h-3 w-3" />
            {downloads}
          </span>
          <QualityBadge score={pkg.qualityScore} />
          <span className="ml-auto text-fg-faint">
            {pkg.latestVersion ? `v${pkg.latestVersion.version}` : "—"}
          </span>
        </div>
      </div>
    </Link>
  );
}
