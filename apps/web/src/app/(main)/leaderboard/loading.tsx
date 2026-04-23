import { Skeleton } from '@/components/ui/skeleton';

export default function LeaderboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Skeleton className="h-8 w-40 mb-8" />
      <div className="space-y-3 mb-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded" />
        ))}
      </div>
    </div>
  );
}
