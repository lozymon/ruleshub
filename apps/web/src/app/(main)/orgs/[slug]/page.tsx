export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Check, Package, Download, Star, Users } from "lucide-react";
import { getOrg, getOrgMembers, getOrgPackages } from "@/lib/api/orgs";
import { PackageCard } from "@/components/packages/package-card";

interface OrgPageProps {
  params: Promise<{ slug: string }>;
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export default async function OrgPage({ params }: OrgPageProps) {
  const { slug } = await params;

  let org;
  try {
    org = await getOrg(slug);
  } catch {
    notFound();
  }

  const [{ data: packages }, members] = await Promise.all([
    getOrgPackages(slug, 1, 50).catch(() => ({ data: [] })),
    getOrgMembers(slug).catch(() => []),
  ]);

  const totalDownloads = packages.reduce((a, p) => a + p.totalDownloads, 0);
  const totalStars = packages.reduce((a, p) => a + p.stars, 0);

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-16">
      {/* Profile header */}
      <div className="flex flex-col gap-6 border-b border-border py-10 sm:flex-row sm:items-start">
        {/* Avatar */}
        <div className="shrink-0">
          {org.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={org.avatarUrl}
              alt={org.displayName}
              className="h-20 w-20 rounded-xl border border-border"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/50 font-mono text-[28px] font-bold text-white">
              {org.displayName[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-mono text-[26px] font-semibold tracking-[-0.02em]">
              {org.displayName}
            </h1>
            {org.verified && (
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                title="Verified organisation"
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            )}
            <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[11px] text-fg-dim">
              {org.slug}
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
              { Icon: Users, label: "Members", value: String(org.memberCount) },
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

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_260px]">
        {/* Packages */}
        <div>
          <h2 className="mb-5 text-[15px] font-semibold">Packages</h2>

          {packages.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-border py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-bg-elev">
                <Package className="h-5 w-5 text-fg-dim" />
              </div>
              <h3 className="mb-1.5 text-[16px] font-medium">
                No packages yet
              </h3>
              <p className="text-fg-dim">
                This organisation hasn&apos;t published anything yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          )}
        </div>

        {/* Members sidebar */}
        {members.length > 0 && (
          <div>
            <h2 className="mb-4 text-[15px] font-semibold">Members</h2>
            <div className="rounded-[10px] border border-border bg-bg-elev">
              {members.map((m, i) => (
                <div
                  key={m.user.id}
                  className={`flex items-center gap-3 px-4 py-3 ${i < members.length - 1 ? "border-b border-border" : ""}`}
                >
                  {m.user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.user.avatarUrl}
                      alt={m.user.username}
                      className="h-7 w-7 rounded-full border border-border"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-bg-elev-2 font-mono text-[11px] font-bold">
                      {m.user.username[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="min-w-0 flex-1 truncate font-mono text-[13px]">
                    {m.user.username}
                  </span>
                  <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] text-fg-dim">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
