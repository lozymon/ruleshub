'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Upload, Download, Star, Package, Eye, Trash2 } from 'lucide-react';
import { searchPackages, yankVersion } from '@/lib/api/packages';
import { routes } from '@/lib/routes';
import { useAuth } from '@/context/auth-context';
import type { PackageDto } from '@ruleshub/types';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-border bg-bg-elev p-[18px]">
      <div className="text-[12px] font-medium uppercase tracking-[0.06em] text-fg-dim">
        {label}
      </div>
      <div className="mt-1.5 font-mono text-[26px] font-medium tracking-[-0.01em]">
        {value}
      </div>
    </div>
  );
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (d < 1) return 'today';
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [packages, setPackages] = useState<PackageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [yankingId, setYankingId] = useState<string | null>(null);

  const fetchPackages = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await searchPackages({
        namespace: user.username,
        limit: 100,
      });
      setPackages(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  async function handleYank(pkg: PackageDto) {
    if (!token || !pkg.latestVersion) return;
    if (
      !window.confirm(
        `Yank ${pkg.namespace}/${pkg.name}@${pkg.latestVersion.version}? This removes it from the registry.`,
      )
    )
      return;
    setYankingId(pkg.id);
    try {
      await yankVersion(
        pkg.namespace,
        pkg.name,
        pkg.latestVersion.version,
        token,
      );
      await fetchPackages();
    } finally {
      setYankingId(null);
    }
  }

  const totalDownloads = packages.reduce((a, p) => a + p.totalDownloads, 0);
  const totalStars = packages.reduce((a, p) => a + p.stars, 0);

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-8">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
            Dashboard
          </h1>
          <p className="mt-1 text-fg-dim">
            {user ? `Signed in as ${user.username}` : 'Loading…'}
          </p>
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
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Total downloads" value={fmtNum(totalDownloads)} />
        <StatCard label="Total stars" value={totalStars.toLocaleString()} />
        <StatCard label="Packages" value={String(packages.length)} />
      </div>

      {/* Packages table */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold">My packages</h3>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-[10px] border border-border bg-bg-elev"
              />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-border py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-bg-elev">
              <Package className="h-5 w-5 text-fg-dim" />
            </div>
            <h3 className="mb-1.5 text-[16px] font-medium">No packages yet</h3>
            <p className="mb-5 text-fg-dim">
              Publish your first package to get started.
            </p>
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
                  {[
                    'Package',
                    'Type',
                    'Version',
                    'Downloads',
                    'Stars',
                    'Updated',
                    '',
                  ].map((h, i) => (
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
                  <tr
                    key={p.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-bg-elev-2"
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        href={routes.package(p.namespace + '/' + p.name)}
                        className="font-mono text-[13px] hover:text-primary transition-colors"
                      >
                        {p.namespace}/{p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-fg-muted">
                      {p.type}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[13px]">
                      {p.latestVersion ? `v${p.latestVersion.version}` : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[13px]">
                      <span className="inline-flex items-center gap-1 text-fg-muted">
                        <Download className="h-3 w-3" />
                        {p.totalDownloads.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[13px]">
                      <span className="inline-flex items-center gap-1 text-fg-muted">
                        <Star className="h-3 w-3" />
                        {p.stars.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[12.5px] text-fg-dim">
                      {timeAgo(p.updatedAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={routes.package(p.namespace + '/' + p.name)}
                          className="flex h-7 w-7 items-center justify-center rounded text-fg-muted transition-colors hover:bg-bg-elev hover:text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => handleYank(p)}
                          disabled={yankingId === p.id || !p.latestVersion}
                          className="flex h-7 w-7 items-center justify-center rounded text-fg-muted transition-colors hover:bg-bg-elev hover:text-destructive disabled:opacity-40"
                          title={
                            p.latestVersion
                              ? `Yank v${p.latestVersion.version}`
                              : 'No versions'
                          }
                        >
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
