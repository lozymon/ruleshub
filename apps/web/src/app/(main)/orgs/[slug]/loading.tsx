export default function OrgLoading() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-16">
      <div className="flex flex-col gap-6 border-b border-border py-10 sm:flex-row sm:items-start">
        <div className="h-20 w-20 animate-pulse rounded-xl bg-bg-elev" />
        <div className="flex-1 space-y-3">
          <div className="h-7 w-48 animate-pulse rounded bg-bg-elev" />
          <div className="flex gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-4 w-20 animate-pulse rounded bg-bg-elev"
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-[10px] border border-border bg-bg-elev"
          />
        ))}
      </div>
    </div>
  );
}
