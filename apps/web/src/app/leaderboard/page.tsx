export const dynamic = 'force-dynamic';

import { apiClient } from '@/lib/api/client';
import { PackageCard } from '@/components/packages/package-card';
import type { PackageDto, UserDto } from '@ruleshub/types';

interface LeaderboardData {
  topPublishers: (UserDto & { _count: { packages: number } })[];
  trendingPackages: PackageDto[];
  mostStarred: PackageDto[];
}

export default async function LeaderboardPage() {
  const data = await apiClient.get<LeaderboardData>('/leaderboard').catch(() => ({
    topPublishers: [],
    trendingPackages: [],
    mostStarred: [],
  } as LeaderboardData));

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-8">Leaderboard</h1>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Top publishers</h2>
        <div className="space-y-3">
          {data.topPublishers.map((user, i) => (
            <div key={user.id} className="flex items-center gap-3 p-3 rounded border">
              <span className="text-muted-foreground w-6 text-sm font-mono">{i + 1}</span>
              {user.avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={user.username} className="w-8 h-8 rounded-full" />
              )}
              <span className="font-medium flex-1">{user.username}</span>
              <span className="text-sm text-muted-foreground">{user._count.packages} packages</span>
            </div>
          ))}
          {data.topPublishers.length === 0 && (
            <p className="text-muted-foreground">No publishers yet.</p>
          )}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Most downloaded</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.trendingPackages.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
          {data.trendingPackages.length === 0 && (
            <p className="text-muted-foreground">No packages yet.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Most starred</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.mostStarred.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
          {data.mostStarred.length === 0 && (
            <p className="text-muted-foreground">No packages yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
