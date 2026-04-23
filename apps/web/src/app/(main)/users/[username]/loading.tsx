import { Skeleton } from '@/components/ui/skeleton';
import { PackageCardSkeleton } from '@/components/packages/package-card-skeleton';

export default function UserLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-6 w-24 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <PackageCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
