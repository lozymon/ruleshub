import { PackageCardSkeleton } from '@/components/packages/package-card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function ToolLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-40 mb-1" />
      <Skeleton className="h-4 w-24 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <PackageCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
