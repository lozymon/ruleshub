import { PackageCardSkeleton } from "@/components/packages/package-card-skeleton";

export default function UserLoading() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-16">
      {/* Profile header skeleton */}
      <div className="flex flex-col gap-6 border-b border-border py-10 sm:flex-row sm:items-start">
        <div className="h-20 w-20 shrink-0 animate-pulse rounded-full bg-bg-elev-2" />
        <div className="flex-1 space-y-3">
          <div className="h-7 w-40 animate-pulse rounded-md bg-bg-elev-2" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-bg-elev-2" />
          <div className="flex gap-6 pt-2">
            {[80, 96, 72].map((w) => (
              <div
                key={w}
                className={`h-4 w-${w} animate-pulse rounded-md bg-bg-elev-2`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Packages skeleton */}
      <div className="mt-8">
        <div className="mb-5 h-5 w-20 animate-pulse rounded-md bg-bg-elev-2" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PackageCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
