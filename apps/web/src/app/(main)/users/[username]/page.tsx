// Public profile data updates infrequently (badge counts, package totals).
// 60s revalidation gives near-fresh results without rendering on every hit.
export const revalidate = 60;

import { notFound } from "next/navigation";
import { Check, Star, Download, Settings } from "lucide-react";
import { getUser } from "@/lib/api/users";
import { searchPackages } from "@/lib/api/packages";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { AvatarGradient } from "@/components/ui/avatar-gradient";

interface UserPageProps {
  params: Promise<{ username: string }>;
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
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

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-16">
      {/* Profile header */}
      <div className="flex flex-col gap-6 border-b border-border py-10 sm:flex-row sm:items-start">
        {/* Avatar — 96px, deterministic gradient */}
        <AvatarGradient handle={username} src={user.avatarUrl} size={96} />

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
            <p className="mt-2 max-w-[560px] text-[14px] text-fg-muted">
              {user.bio}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px] text-fg-dim">
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.12-1.47-1.12-1.47-.91-.62.07-.61.07-.61 1.01.07 1.54 1.04 1.54 1.04.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.28.1-2.66 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.41.1 2.66.64.7 1.03 1.59 1.03 2.68 0 3.84-2.35 4.68-4.58 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
              </svg>
              github.com/{username}
            </a>
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-star" />
              {fmtNum(totalStars)} stars received
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5" />
              {fmtNum(totalDownloads)} total installs
            </span>
          </div>
        </div>

        {/* Follow + settings buttons */}
        <div className="flex shrink-0 items-center gap-2">
          <button className="inline-flex h-[34px] items-center gap-1.5 rounded-sm border border-border-strong px-3 text-[13px] font-medium text-foreground transition-colors hover:border-border-hover hover:bg-bg-elev">
            Follow
          </button>
          <button className="flex h-[34px] w-[34px] items-center justify-center rounded-sm border border-border text-fg-muted transition-colors hover:border-border-hover hover:bg-bg-elev hover:text-foreground">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <ProfileTabs packages={packages} packageCount={packages.length} />
      </div>
    </div>
  );
}
