import { PackageCardSkeleton } from "@/components/packages/package-card-skeleton";

export default function LeaderboardLoading() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-16">
      {/* Header skeleton */}
      <div className="border-b border-border py-10">
        <div className="h-8 w-48 animate-pulse rounded-md bg-bg-elev-2" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded-md bg-bg-elev-2" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
        {/* Publishers skeleton */}
        <div>
          <div className="mb-4 h-5 w-32 animate-pulse rounded-md bg-bg-elev-2" />
          <div className="overflow-hidden rounded-[10px] border border-border bg-bg-elev">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0"
              >
                <div className="h-4 w-4 animate-pulse rounded bg-bg-elev-2" />
                <div className="h-7 w-7 animate-pulse rounded-full bg-bg-elev-2" />
                <div className="h-4 flex-1 animate-pulse rounded bg-bg-elev-2" />
                <div className="h-3 w-12 animate-pulse rounded bg-bg-elev-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Packages skeleton */}
        <div className="space-y-8">
          <div>
            <div className="mb-4 h-5 w-36 animate-pulse rounded-md bg-bg-elev-2" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <PackageCardSkeleton key={i} />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-4 h-5 w-28 animate-pulse rounded-md bg-bg-elev-2" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <PackageCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
