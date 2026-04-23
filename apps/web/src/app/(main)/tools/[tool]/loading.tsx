import { PackageCardSkeleton } from "@/components/packages/package-card-skeleton";

export default function ToolLoading() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-16">
      {/* Header skeleton */}
      <div className="border-b border-border py-10">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 animate-pulse rounded-full bg-bg-elev-2" />
          <div className="h-8 w-40 animate-pulse rounded-md bg-bg-elev-2" />
        </div>
        <div className="mt-2 h-4 w-80 animate-pulse rounded-md bg-bg-elev-2" />
        <div className="mt-1 h-3 w-24 animate-pulse rounded-md bg-bg-elev-2" />
      </div>

      {/* Tool tabs skeleton */}
      <div className="mt-6 flex gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="h-7 w-20 animate-pulse rounded-md bg-bg-elev-2"
          />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PackageCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
