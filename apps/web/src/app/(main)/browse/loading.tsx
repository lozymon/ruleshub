import { PackageCardSkeleton } from '@/components/packages/package-card-skeleton';

export default function BrowseLoading() {
  return (
    <div className="mx-auto max-w-[1240px] px-6">
      <div className="pt-7">
        <div className="skeleton-shimmer h-7 w-48 rounded" />
        <div className="skeleton-shimmer mt-2 h-4 w-32 rounded" />
      </div>

      <div className="mt-5 border-b border-border pb-px">
        <div className="flex gap-1 py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-8 w-20 rounded" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 py-8 md:grid-cols-[240px_1fr]">
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-7 rounded" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PackageCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
