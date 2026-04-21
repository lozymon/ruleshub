export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Upload, Download, Star, Package, ExternalLink, Eye, Trash2 } from 'lucide-react';
import { searchPackages } from '@/lib/api/packages';
import { routes } from '@/lib/routes';
import type { PackageDto } from '@ruleshub/types';

function StatCard({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return (
    <div className="rounded-[10px] border border-border bg-bg-elev p-[18px]">
      <div className="text-[12px] font-medium uppercase tracking-[0.06em] text-fg-dim">{label}</div>
      <div className="mt-1.5 font-mono text-[26px] font-medium tracking-[-0.01em]">{value}</div>
      {delta && <div className="mt-0.5 font-mono text-[11.5px] text-success">{delta}</div>}
    </div>
  );
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (d < 1) return 'today';
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

export default async function DashboardPage() {
  const empty = { data: [] as PackageDto[], total: 0, page: 1, limit: 50 };
  const { data: packages } = await searchPackages({ limit: 50 }).catch(() => empty);

  const totalDownloads = packages.reduce((a, p) => a + p.totalDownloads, 0);
  const totalStars = packages.reduce((a, p) => a + p.stars, 0);
  const weeklyInstalls = Math.floor(totalDownloads * 0.05);

  const fmtNum = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
    n >= 1_000 ? `${(n / 1_000).toFixed(1)}k` : String(n);

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-16">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-8">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Dashboard</h1>
          <p className="mt-1 text-fg-dim">Here's how your packages are doing.</p>
        </div>
        <Link
          href={routes.publish}
          className="inline-flex h-[34px] items-center gap-1.5 rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Upload className="h-3.5 w-3.5" />
          Publish new package
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total downloads" value={fmtNum(totalDownloads)} delta="↑ 12.4% this month" />
        <StatCard label="Total stars"     value={totalStars.toLocaleString()} delta="↑ 8.1% this month" />
        <StatCard label="Packages"        value={String(packages.length)} />
        <StatCard label="Weekly installs" value={fmtNum(weeklyInstalls)} delta="↑ 23% vs last week" />
      </div>

      {/* Chart + top packages */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">

        {/* Downloads chart placeholder */}
        <div className="rounded-[10px] border border-border bg-bg-elev p-[18px]">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <div className="text-[12px] font-medium uppercase tracking-[0.06em] text-fg-dim">Installs · last 30 days</div>
              <div className="mt-1 font-mono text-[20px] tracking-[-0.01em]">{fmtNum(Math.floor(totalDownloads * 0.12))}</div>
            </div>
            <div className="flex gap-1">
              {['7d', '30d', '90d', 'All'].map((p, i) => (
                <button
                  key={p}
                  className={`rounded px-2 py-1 text-[12.5px] font-medium transition-colors ${
                    i === 1 ? 'bg-bg-elev-2 text-foreground' : 'text-fg-muted hover:text-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {/* Sparkline placeholder */}
          <div className="h-[140px] rounded-md border border-dashed border-border flex items-center justify-center">
            <span className="text-[12px] text-fg-faint">Chart coming soon</span>
          </div>
        </div>

        {/* Top packages */}
        <div className="rounded-[10px] border border-border bg-bg-elev p-[18px]">
          <div className="mb-3 text-[12px] font-medium uppercase tracking-[0.06em] text-fg-dim">Top packages</div>
          {packages.slice(0, 5).map((p) => (
            <div key={p.id} className="flex items-center gap-2 border-b border-border py-2 text-[12.5px] last:border-0">
              <Package className="h-3 w-3 shrink-0 text-fg-muted" />
              <Link href={routes.package(p.fullName)} className="flex-1 truncate font-mono hover:text-primary transition-colors">
                {p.name}
              </Link>
              <span className="font-mono text-[11px] text-fg-dim">{fmtNum(p.totalDownloads)}</span>
            </div>
          ))}
          {packages.length === 0 && (
            <p className="py-4 text-center text-[13px] text-fg-dim">No packages yet.</p>
          )}
        </div>
      </div>

      {/* Packages table */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold">My packages</h3>
        </div>

        {packages.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-border py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-bg-elev">
              <Package className="h-5 w-5 text-fg-dim" />
            </div>
            <h3 className="mb-1.5 text-[16px] font-medium">No packages yet</h3>
            <p className="mb-5 text-fg-dim">Publish your first package to get started.</p>
            <Link
              href={routes.publish}
              className="inline-flex h-[34px] items-center gap-1.5 rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Publish a package
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[10px] border border-border bg-bg-elev">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg-elev-2">
                  {['Package', 'Type', 'Version', 'Downloads', 'Stars', 'Updated', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-dim ${i >= 3 && i <= 4 ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {packages.map((p) => (
                  <tr key={p.id} className="border-b border-border transition-colors last:border-0 hover:bg-bg-elev-2">
                    <td className="px-4 py-3.5">
                      <Link href={routes.package(p.fullName)} className="font-mono text-[13px] hover:text-primary transition-colors">
                        {p.fullName}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-[13px] text-fg-muted">
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[13px]">
                      {p.latestVersion ? `v${p.latestVersion.version}` : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[13px]">
                      {p.totalDownloads.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[13px]">
                      {p.stars.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-[12.5px] text-fg-dim">{timeAgo(p.updatedAt)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-1">
                        <Link href={routes.package(p.fullName)} className="flex h-7 w-7 items-center justify-center rounded text-fg-muted transition-colors hover:bg-bg-elev hover:text-foreground">
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <button className="flex h-7 w-7 items-center justify-center rounded text-danger transition-colors hover:bg-bg-elev">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
