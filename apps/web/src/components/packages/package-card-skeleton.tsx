export function PackageCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-border bg-bg-elev p-[18px]">
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <div className="skeleton-shimmer h-8 w-8 shrink-0 rounded-md" />
        <div className="flex-1 space-y-2">
          <div className="skeleton-shimmer h-[14px] w-[60%] rounded" />
          <div className="skeleton-shimmer h-[10px] w-[30%] rounded" />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="skeleton-shimmer h-[10px] w-full rounded" />
        <div className="skeleton-shimmer h-[10px] w-[80%] rounded" />
      </div>

      {/* Tool badges */}
      <div className="flex gap-1.5">
        <div className="skeleton-shimmer h-[22px] w-14 rounded-[4px]" />
        <div className="skeleton-shimmer h-[22px] w-12 rounded-[4px]" />
        <div className="skeleton-shimmer h-[22px] w-16 rounded-[4px]" />
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3.5 border-t border-border pt-2.5">
        <div className="skeleton-shimmer h-[10px] w-10 rounded" />
        <div className="skeleton-shimmer h-[10px] w-10 rounded" />
        <div className="skeleton-shimmer ml-auto h-[10px] w-10 rounded" />
      </div>
    </div>
  );
}
