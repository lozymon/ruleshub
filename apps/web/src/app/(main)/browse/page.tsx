export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { searchPackages } from "@/lib/api/packages";
import { PackageCard } from "@/components/packages/package-card";
import { PackageCardSkeleton } from "@/components/packages/package-card-skeleton";
import { BrowseFilters } from "@/components/packages/browse-filters";
import { BrowsePagination } from "@/components/packages/browse-pagination";
import { routes } from "@/lib/routes";
import { TOOL_LABELS } from "@ruleshub/types";
import type {
  SupportedTool,
  PackageSearchParams,
  AssetType,
} from "@ruleshub/types";
import { TOOL_COLORS } from "@/lib/tool-colors";
import { cn } from "@/lib/utils";

const TOOLS = Object.entries(TOOL_LABELS) as [SupportedTool, string][];
const TYPE_IDS: AssetType[] = [
  "rule",
  "command",
  "workflow",
  "agent",
  "mcp-server",
  "pack",
  "skill",
];
const PER_PAGE = 9;

interface BrowsePageProps {
  searchParams: Promise<PackageSearchParams & { sort?: string; page?: string }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page ?? 1));
  const empty = { data: [], total: 0, page: 1, limit: PER_PAGE };

  const [packagesResult, ...allTotals] = await Promise.all([
    searchPackages({ ...params, limit: PER_PAGE, page: currentPage }).catch(
      () => empty,
    ),
    ...TOOLS.map(([tool]) =>
      searchPackages({ tool, limit: 1 })
        .then((r) => r.total)
        .catch(() => 0),
    ),
    ...TYPE_IDS.map((type) =>
      searchPackages({ type, limit: 1 })
        .then((r) => r.total)
        .catch(() => 0),
    ),
  ]);

  const { data: packages, total } = packagesResult;
  const toolTotals = allTotals.slice(0, TOOLS.length);
  const typeTotals = allTotals.slice(TOOLS.length);

  const toolCountMap = Object.fromEntries(
    TOOLS.map(([tool], i) => [tool, toolTotals[i] as number]),
  ) as Record<SupportedTool, number>;

  const typeCountMap = Object.fromEntries(
    TYPE_IDS.map((type, i) => [type, typeTotals[i] as number]),
  ) as Record<AssetType, number>;

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const currentTool = params.tool ?? "all";

  return (
    <div className="mx-auto max-w-[1240px] px-6">
      {/* Page header */}
      <div className="pt-7 pb-5">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
          Browse packages
        </h1>
        <p className="mt-1.5 text-fg-dim">
          <span className="font-mono">{total.toLocaleString()}</span> packages
          matching your filters
        </p>
      </div>

      {/* Tool tabs */}
      <div className="border-b border-border">
        <div className="-mx-6 flex overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href={routes.browse}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 border-b-2 px-[18px] py-3.5 text-[13px] font-medium whitespace-nowrap transition-colors",
              currentTool === "all"
                ? "border-primary text-foreground"
                : "border-transparent text-fg-muted hover:text-foreground",
            )}
          >
            All
            <span
              className={cn(
                "rounded-[10px] px-1.5 py-0.5 font-mono text-[11px]",
                currentTool === "all"
                  ? "bg-[var(--rh-accent-tint)] text-primary"
                  : "bg-bg-elev text-fg-faint",
              )}
            >
              {total}
            </span>
          </Link>
          {TOOLS.map(([tool, label]) => (
            <Link
              key={tool}
              href={`${routes.browse}?tool=${tool}`}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 border-b-2 px-[18px] py-3.5 text-[13px] font-medium whitespace-nowrap transition-colors",
                currentTool === tool
                  ? "border-primary text-foreground"
                  : "border-transparent text-fg-muted hover:text-foreground",
              )}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: TOOL_COLORS[tool] }}
              />
              {label}
              <span
                className={cn(
                  "rounded-[10px] px-1.5 py-0.5 font-mono text-[11px]",
                  currentTool === tool
                    ? "bg-[var(--rh-accent-tint)] text-primary"
                    : "bg-bg-elev text-fg-faint",
                )}
              >
                {toolCountMap[tool]}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Content: sidebar + grid */}
      <div className="grid grid-cols-1 gap-8 py-8 pb-16 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="md:sticky md:top-20 md:self-start">
          <BrowseFilters
            current={params}
            total={total}
            typeCounts={typeCountMap}
          />
        </aside>

        {/* Cards grid + pagination */}
        <div>
          {packages.length === 0 ? (
            <div className="rounded-sm border border-dashed border-border py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-sm border border-border bg-bg-elev">
                <Search className="h-5 w-5 text-fg-dim" />
              </div>
              <h3 className="mb-1.5 text-[16px] font-medium">
                No packages match
              </h3>
              <p className="mb-5 text-fg-dim">
                Try a different combination of filters or a broader search term.
              </p>
              <Link
                href={routes.browse}
                className="inline-flex h-[34px] items-center rounded-sm border border-border-strong px-3 text-[13px] font-medium transition-colors hover:border-border-hover hover:bg-bg-elev"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {packages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
              <Suspense>
                <BrowsePagination page={currentPage} totalPages={totalPages} />
              </Suspense>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
