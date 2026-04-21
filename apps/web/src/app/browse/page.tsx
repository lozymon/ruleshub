export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import { searchPackages } from '@/lib/api/packages';
import { PackageCard } from '@/components/packages/package-card';
import { BrowseFilters } from '@/components/packages/browse-filters';
import { PackageCardSkeleton } from '@/components/packages/package-card-skeleton';
import { routes } from '@/lib/routes';
import { TOOL_LABELS } from '@ruleshub/types';
import type { SupportedTool, PackageSearchParams } from '@ruleshub/types';
import { TOOL_COLORS } from '@/lib/tool-colors';
import { cn } from '@/lib/utils';

const TOOLS = Object.entries(TOOL_LABELS) as [SupportedTool, string][];

interface BrowsePageProps {
  searchParams: Promise<PackageSearchParams & { sort?: string }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const empty = { data: [], total: 0, page: 1, limit: 9 };
  const { data: packages, total } = await searchPackages(params).catch(() => empty);

  const currentTool = params.tool ?? 'all';

  return (
    <div className="mx-auto max-w-[1240px] px-6">

      {/* Page header */}
      <div className="pt-7 pb-0">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Browse packages</h1>
        <p className="mt-1.5 text-fg-dim">
          <span className="font-mono">{total.toLocaleString()}</span> packages matching your filters
        </p>
      </div>

      {/* Tool tabs */}
      <div className="mt-5 border-b border-border">
        <div className="-mx-6 flex overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href={routes.browse}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 border-b-2 px-[18px] py-3.5 text-[13px] font-medium whitespace-nowrap transition-colors',
              currentTool === 'all'
                ? 'border-primary text-foreground'
                : 'border-transparent text-fg-muted hover:text-foreground',
            )}
          >
            All
          </Link>
          {TOOLS.map(([tool, label]) => (
            <Link
              key={tool}
              href={`${routes.browse}?tool=${tool}`}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 border-b-2 px-[18px] py-3.5 text-[13px] font-medium whitespace-nowrap transition-colors',
                currentTool === tool
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-fg-muted hover:text-foreground',
              )}
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: TOOL_COLORS[tool] }} />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Content: sidebar + grid */}
      <div className="grid grid-cols-1 gap-8 py-8 pb-16 md:grid-cols-[240px_1fr]">

        {/* Sidebar */}
        <aside className="md:sticky md:top-20 md:self-start">
          <BrowseFilters current={params} />
        </aside>

        {/* Cards grid */}
        <div>
          {packages.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-border py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-bg-elev">
                <Search className="h-5 w-5 text-fg-dim" />
              </div>
              <h3 className="mb-1.5 text-[16px] font-medium">No packages match</h3>
              <p className="mb-5 text-fg-dim">Try a different combination of filters or a broader search term.</p>
              <Link
                href={routes.browse}
                className="inline-flex h-[34px] items-center rounded-md border border-border-strong px-3 text-[13px] font-medium transition-colors hover:border-border-hover hover:bg-bg-elev"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
