import { notFound } from 'next/navigation';
import { searchPackages } from '@/lib/api/packages';
import { PackageCard } from '@/components/packages/package-card';
import { PackageCardSkeleton } from '@/components/packages/package-card-skeleton';
import { TOOL_LABELS, SupportedToolSchema, type SupportedTool } from '@ruleshub/types';

interface ToolPageProps {
  params: Promise<{ tool: string }>;
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { tool } = await params;

  const parsed = SupportedToolSchema.safeParse(tool);
  if (!parsed.success) notFound();

  const { data: packages, total } = await searchPackages({ tool: parsed.data, limit: 20 });
  const label = TOOL_LABELS[parsed.data as SupportedTool];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">{label}</h1>
      <p className="text-muted-foreground mb-6">{total} asset{total !== 1 ? 's' : ''} available</p>
      {packages.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">
          No assets published for {label} yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {packages.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
        </div>
      )}
    </div>
  );
}
