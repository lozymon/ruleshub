export default function OrgDashboardLoading() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-16">
      <div className="py-8 space-y-4">
        <div className="h-8 w-56 animate-pulse rounded bg-bg-elev" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-[10px] border border-border bg-bg-elev"
            />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-[10px] border border-border bg-bg-elev" />
      </div>
    </div>
  );
}
