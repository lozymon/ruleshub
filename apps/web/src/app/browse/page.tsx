import { Suspense } from 'react';
import { searchPackages } from '@/lib/api/packages';
import { PackageCard } from '@/components/packages/package-card';
import { BrowseFilters } from '@/components/packages/browse-filters';
import { PackageCardSkeleton } from '@/components/packages/package-card-skeleton';
import type { PackageSearchParams } from '@ruleshub/types';

interface BrowsePageProps {
  searchParams: Promise<PackageSearchParams>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const { data: packages, total, page, limit } = await searchPackages(params);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <aside className="w-64 shrink-0">
          <BrowseFilters current={params} />
        </aside>
        <main className="flex-1">
          <p className="text-sm text-muted-foreground mb-4">
            {total} {total === 1 ? 'asset' : 'assets'}
          </p>
          {packages.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              No assets found. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
