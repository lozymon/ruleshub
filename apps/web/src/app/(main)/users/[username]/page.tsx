export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Check, Package, Download, Star, Calendar } from "lucide-react";
import { getUser } from "@/lib/api/users";
import { searchPackages } from "@/lib/api/packages";
import { PackageCard } from "@/components/packages/package-card";

interface UserPageProps {
  params: Promise<{ username: string }>;
}

function timeAgo(iso: string) {
  const months = Math.floor(
    (Date.now() - new Date(iso).getTime()) / (30 * 86_400_000),
  );
  if (months < 1) return "this month";
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;

  let user;
  try {
    user = await getUser(username);
  } catch {
    notFound();
  }

  const { data: packages } = await searchPackages({
    namespace: username,
    limit: 50,
  }).catch(() => ({ data: [] }));

  const totalDownloads = packages.reduce((a, p) => a + p.totalDownloads, 0);
  const totalStars = packages.reduce((a, p) => a + p.stars, 0);

  const fmtNum = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
        ? `${(n / 1_000).toFixed(1)}k`
        : String(n);

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-16">
      {/* Profile header */}
      <div className="flex flex-col gap-6 border-b border-border py-10 sm:flex-row sm:items-start">
        {/* Avatar */}
        <div className="shrink-0">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="h-20 w-20 rounded-full border border-border"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/50 font-mono text-[28px] font-bold text-white">
              {username[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-mono text-[26px] font-semibold tracking-[-0.02em]">
              {username}
            </h1>
            {user.verified && (
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                title="Verified publisher"
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            )}
          </div>

          {user.bio && (
            <p className="mt-2 max-w-[560px] text-[14.5px] text-fg-muted">
              {user.bio}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px] text-fg-dim">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Joined {timeAgo(user.createdAt)}
            </span>
          </div>

          {/* Stats */}
          <div className="mt-5 flex flex-wrap gap-6">
            {[
              {
                Icon: Package,
                label: "Packages",
                value: String(packages.length),
              },
              {
                Icon: Download,
                label: "Downloads",
                value: fmtNum(totalDownloads),
              },
              { Icon: Star, label: "Stars", value: fmtNum(totalStars) },
            ].map(({ Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-[13px]"
              >
                <Icon className="h-3.5 w-3.5 text-fg-dim" />
                <span className="font-mono font-medium">{value}</span>
                <span className="text-fg-dim">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Packages */}
      <div className="mt-8">
        <h2 className="mb-5 text-[15px] font-semibold">Packages</h2>

        {packages.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-border py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-bg-elev">
              <Package className="h-5 w-5 text-fg-dim" />
            </div>
            <h3 className="mb-1.5 text-[16px] font-medium">No packages yet</h3>
            <p className="text-fg-dim">
              This publisher hasn&apos;t released anything yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
