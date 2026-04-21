import { PackageCardSkeleton } from '@/components/packages/package-card-skeleton';

export default function BrowseLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <aside className="w-64 shrink-0">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </aside>
        <main className="flex-1">
          <div className="h-4 w-24 bg-muted rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <PackageCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
