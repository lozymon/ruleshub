export const dynamic = "force-dynamic";

import Link from "next/link";
import { Trophy, Flame, Star } from "lucide-react";
import { getLeaderboard } from "@/lib/api/leaderboard";
import { routes } from "@/lib/routes";
import { AvatarGradient } from "@/components/ui/avatar-gradient";

const empty = { topPublishers: [], trendingPackages: [], mostStarred: [] };

const rankColor = (i: number) =>
  i === 0
    ? "text-[#f59e0b]"
    : i === 1
      ? "text-[#94a3b8]"
      : i === 2
        ? "text-[#b45309]"
        : "text-fg-faint";

function RankedRow({
  rank,
  href,
  handle,
  avatar,
  name,
  stat,
  statLabel,
}: {
  rank: number;
  href: string;
  handle: string;
  avatar?: string | null;
  name: string;
  stat: number;
  statLabel: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-0 hover:bg-bg-elev-2"
    >
      <span
        className={`w-5 shrink-0 text-center font-mono text-[13px] font-semibold ${rankColor(rank)}`}
      >
        {rank + 1}
      </span>
      <AvatarGradient handle={handle} src={avatar} size={28} />
      <span className="flex-1 truncate font-mono text-[13px] text-foreground">
        {name}
      </span>
      <span className="shrink-0 font-mono text-[12px] text-fg-dim">
        {stat.toLocaleString()} {statLabel}
      </span>
    </Link>
  );
}

function EmptyColumn({ label }: { label: string }) {
  return <p className="px-4 py-6 text-[13px] text-fg-dim">No {label} yet.</p>;
}

export default async function LeaderboardPage() {
  const data = await getLeaderboard().catch(() => empty);

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-16">
      {/* Header */}
      <div className="border-b border-border py-10">
        <div className="flex items-center gap-2.5">
          <Trophy className="h-6 w-6 text-[#f59e0b]" />
          <h1 className="text-[28px] font-semibold tracking-[-0.02em]">
            Leaderboard
          </h1>
        </div>
        <p className="mt-1 text-[14.5px] text-fg-muted">
          Top publishers and most popular packages this week.
        </p>
      </div>

      {/* 3-column grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Publishers */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-fg-dim">
            <Trophy className="h-3.5 w-3.5" />
            Top Publishers
          </h2>
          <div className="overflow-hidden rounded-sm border border-border bg-bg-elev">
            {data.topPublishers.length === 0 ? (
              <EmptyColumn label="publishers" />
            ) : (
              data.topPublishers.map((user, i) => (
                <RankedRow
                  key={user.id}
                  rank={i}
                  href={routes.user(user.username)}
                  handle={user.username}
                  avatar={user.avatarUrl}
                  name={user.username}
                  stat={user._count.packages}
                  statLabel={user._count.packages === 1 ? "pkg" : "pkgs"}
                />
              ))
            )}
          </div>
        </div>

        {/* Trending This Week */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-fg-dim">
            <Flame className="h-3.5 w-3.5 text-[#f97316]" />
            Trending This Week
          </h2>
          <div className="overflow-hidden rounded-sm border border-border bg-bg-elev">
            {data.trendingPackages.length === 0 ? (
              <EmptyColumn label="trending packages" />
            ) : (
              data.trendingPackages.map((pkg, i) => (
                <RankedRow
                  key={pkg.id}
                  rank={i}
                  href={routes.package(pkg.fullName)}
                  handle={pkg.name}
                  avatar={null}
                  name={`${pkg.namespace}/${pkg.name}`}
                  stat={pkg.totalDownloads}
                  statLabel="dl"
                />
              ))
            )}
          </div>
        </div>

        {/* Most Starred */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-fg-dim">
            <Star className="h-3.5 w-3.5 text-[#f59e0b]" />
            Most Starred
          </h2>
          <div className="overflow-hidden rounded-sm border border-border bg-bg-elev">
            {data.mostStarred.length === 0 ? (
              <EmptyColumn label="starred packages" />
            ) : (
              data.mostStarred.map((pkg, i) => (
                <RankedRow
                  key={pkg.id}
                  rank={i}
                  href={routes.package(pkg.fullName)}
                  handle={pkg.name}
                  avatar={null}
                  name={`${pkg.namespace}/${pkg.name}`}
                  stat={pkg.stars}
                  statLabel={pkg.stars === 1 ? "star" : "stars"}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
