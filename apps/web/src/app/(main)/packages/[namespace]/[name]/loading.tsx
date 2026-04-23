import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function PackageLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="flex gap-1">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <Separator className="mb-6" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
