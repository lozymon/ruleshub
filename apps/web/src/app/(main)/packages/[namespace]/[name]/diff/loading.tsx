export default function DiffLoading() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-16">
      <div className="py-3.5">
        <div className="h-3 w-48 rounded skeleton-shimmer" />
      </div>
      <div className="mb-8 border-b border-border pb-6">
        <div className="h-7 w-40 rounded skeleton-shimmer" />
        <div className="mt-3 flex items-center gap-2">
          <div className="h-6 w-16 rounded skeleton-shimmer" />
          <div className="h-3 w-4 rounded skeleton-shimmer" />
          <div className="h-6 w-16 rounded skeleton-shimmer" />
        </div>
      </div>
      <div className="overflow-hidden rounded-[10px] border border-border">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[160px_1fr] border-b border-border last:border-0"
          >
            <div className="border-r border-border px-4 py-3">
              <div className="h-3 w-20 rounded skeleton-shimmer" />
              <div className="mt-2 h-4 w-14 rounded skeleton-shimmer" />
            </div>
            <div className="px-4 py-3">
              <div className="h-3 w-32 rounded skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
