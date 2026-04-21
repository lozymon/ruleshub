export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { searchPackages } from '@/lib/api/packages';
import { PackageCard } from '@/components/packages/package-card';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { routes } from '@/lib/routes';
import { TOOL_LABELS, type SupportedTool } from '@ruleshub/types';
import { cn } from '@/lib/utils';

const TOOLS = Object.entries(TOOL_LABELS) as [SupportedTool, string][];

export default async function HomePage() {
  const [{ data: trending, total }, { data: recent }] = await Promise.all([
    searchPackages({ limit: 6 }),
    searchPackages({ limit: 6 }),
  ]);

  return (
    <main>
      {/* Hero */}
      <section className="border-b bg-muted/30 py-20 px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          The registry for AI coding tool assets
        </h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
          Publish and install rules, commands, workflows, agents, and MCP servers
          for Claude Code, Cursor, Copilot, and more.
        </p>
        <div className="flex justify-center gap-3">
          <Link href={routes.browse} className={cn(buttonVariants({ size: 'lg' }))}>
            Browse assets
          </Link>
          <Link href={routes.publish} className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
            Publish yours →
          </Link>
        </div>
      </section>

      {/* Tool filter tabs */}
      <section className="border-b py-4 px-4 overflow-x-auto">
        <div className="container mx-auto flex gap-2 flex-wrap">
          <Link href={routes.browse}>
            <Badge variant="secondary" className="cursor-pointer">All tools</Badge>
          </Link>
          {TOOLS.map(([value, label]) => (
            <Link key={value} href={`${routes.browse}?tool=${value}`}>
              <Badge variant="outline" className="cursor-pointer">{label}</Badge>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-b py-4 px-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          <span className="font-semibold text-foreground">{total}</span> assets published
        </div>
      </section>

      {/* Trending */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Trending</h2>
          <Link href={routes.browse} className="text-sm text-muted-foreground hover:underline">
            View all →
          </Link>
        </div>
        {trending.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No assets yet.{' '}
            <Link href={routes.publish} className="underline">Be the first to publish →</Link>
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {trending.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
          </div>
        )}
      </section>

      {/* Recently published */}
      <section className="container mx-auto px-4 py-10 border-t">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recently published</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {recent.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
        </div>
      </section>
    </main>
  );
}
