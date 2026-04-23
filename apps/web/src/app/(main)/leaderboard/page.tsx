export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Trophy, Flame, Star, Check } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { PackageCard } from '@/components/packages/package-card';
import { routes } from '@/lib/routes';
import type { PackageDto, UserDto } from '@ruleshub/types';

interface LeaderboardData {
  topPublishers: (UserDto & { _count: { packages: number } })[];
  trendingPackages: PackageDto[];
  mostStarred: PackageDto[];
}

const empty: LeaderboardData = { topPublishers: [], trendingPackages: [], mostStarred: [] };

export default async function LeaderboardPage() {
  const data = await apiClient.get<LeaderboardData>('/leaderboard').catch(() => empty);

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-16">

      {/* Header */}
      <div className="border-b border-border py-10">
        <div className="flex items-center gap-2.5">
          <Trophy className="h-6 w-6 text-[#f59e0b]" />
          <h1 className="text-[28px] font-semibold tracking-[-0.02em]">Leaderboard</h1>
        </div>
        <p className="mt-1 text-[14.5px] text-fg-muted">Top publishers and most popular packages this week.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">

        {/* Top publishers */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-[14px] font-semibold">
            <Trophy className="h-4 w-4 text-fg-dim" />
            Top publishers
          </h2>

          {data.topPublishers.length === 0 ? (
            <p className="text-[13px] text-fg-dim">No publishers yet.</p>
          ) : (
            <div className="overflow-hidden rounded-[10px] border border-border bg-bg-elev">
              {data.topPublishers.map((user, i) => (
                <Link
                  key={user.id}
                  href={routes.user(user.username)}
                  className="flex items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-0 hover:bg-bg-elev-2"
                >
                  <span className={`w-6 shrink-0 text-center font-mono text-[13px] font-semibold ${
                    i === 0 ? 'text-[#f59e0b]' :
                    i === 1 ? 'text-[#94a3b8]' :
                    i === 2 ? 'text-[#b45309]' :
                              'text-fg-faint'
                  }`}>
                    {i + 1}
                  </span>

                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt={user.username} className="h-7 w-7 rounded-full border border-border" />
                  ) : (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/50 font-mono text-[11px] font-bold text-white">
                      {user.username[0]?.toUpperCase()}
                    </div>
                  )}

                  <span className="flex-1 truncate font-mono text-[13px] text-foreground">
                    {user.username}
                  </span>

                  {user.verified && (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground" title="Verified">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                  )}

                  <span className="shrink-0 font-mono text-[12px] text-fg-dim">
                    {user._count.packages} pkg{user._count.packages !== 1 ? 's' : ''}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-8">

          {/* Trending / most downloaded */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-[14px] font-semibold">
              <Flame className="h-4 w-4 text-[#f97316]" />
              Most downloaded
            </h2>
            {data.trendingPackages.length === 0 ? (
              <p className="text-[13px] text-fg-dim">No packages yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {data.trendingPackages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            )}
          </div>

          {/* Most starred */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-[14px] font-semibold">
              <Star className="h-4 w-4 text-[#f59e0b]" />
              Most starred
            </h2>
            {data.mostStarred.length === 0 ? (
              <p className="text-[13px] text-fg-dim">No packages yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {data.mostStarred.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
