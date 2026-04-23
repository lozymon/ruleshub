export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Flame, Clock, ArrowRight } from 'lucide-react';
import { searchPackages } from '@/lib/api/packages';
import { PackageCard } from '@/components/packages/package-card';
import { routes } from '@/lib/routes';
import { TOOL_LABELS } from '@ruleshub/types';
import type { SupportedTool } from '@ruleshub/types';
import { TOOL_COLORS as toolColors } from '@/lib/tool-colors';

const TOOLS = Object.entries(TOOL_LABELS) as [SupportedTool, string][];

export default async function HomePage() {
  const empty = { data: [], total: 0 };
  const [{ data: trending, total }, { data: recent }] = await Promise.all([
    searchPackages({ limit: 6 }).catch(() => empty),
    searchPackages({ limit: 6 }).catch(() => empty),
  ]);

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border pb-12 pt-[72px]">
        {/* Grid + radial glow */}
        <div className="hero-grid" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,var(--rh-accent-tint),transparent_70%)]" />

        <div className="relative mx-auto max-w-[1240px] px-6">
          {/* Kicker pill */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--rh-accent-border)] bg-[var(--rh-accent-tint)] px-2.5 py-1 font-mono text-[12px] text-[var(--rh-accent)]">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--rh-accent)]" />
            CLI v0.1.0 now available
          </div>

          <h1 className="mb-[18px] max-w-[820px] text-[56px] font-semibold leading-[1.05] tracking-[-0.035em]">
            The registry for{' '}
            <span className="text-primary">AI coding tool</span> assets.
          </h1>

          <p className="mb-7 max-w-[620px] text-[18px] leading-relaxed text-fg-muted">
            Publish and install rules, commands, workflows, agents, and MCP servers for Claude Code, Cursor, Copilot, and more — one manifest, every tool.
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={routes.browse}
              className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-[18px] text-[14px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Browse assets <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={routes.publish}
              className="inline-flex h-10 items-center rounded-md border border-border-strong px-[18px] text-[14px] font-medium text-foreground transition-colors hover:border-border-hover hover:bg-bg-elev"
            >
              Publish yours →
            </Link>
            <span className="inline-flex items-center gap-2.5 rounded-md border border-border bg-bg-elev px-3.5 py-2 font-mono text-[13px] text-fg-muted">
              <span className="text-fg-faint">$</span>
              <span className="text-foreground">
                npx ruleshub install{' '}
                <span className="text-primary">vercel/nextjs-rules</span>
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 divide-x divide-border md:grid-cols-4">
          {[
            { num: total.toLocaleString(), label: 'Assets published', delta: null },
            { num: '—', label: 'Monthly installs', delta: null },
            { num: '—', label: 'Publishers', delta: null },
            { num: String(TOOLS.length), label: 'Tools supported', delta: '+ more coming' },
          ].map(({ num, label, delta }) => (
            <div key={label} className="px-7 py-6">
              <div className="font-mono text-[26px] font-medium tracking-[-0.02em]">{num}</div>
              <div className="mt-1 text-[12px] font-medium uppercase tracking-[0.06em] text-fg-dim">
                {label}
              </div>
              {delta && (
                <div className="mt-0.5 font-mono text-[11.5px] text-success">{delta}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Tool tabs ───────────────────────────────────────── */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="-mx-6 flex overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href={routes.browse}
              className="inline-flex shrink-0 items-center gap-2 border-b-2 border-primary px-[18px] py-3.5 text-[13px] font-medium whitespace-nowrap text-foreground"
            >
              All
              <span className="rounded-[10px] bg-[var(--rh-accent-tint)] px-1.5 py-0.5 font-mono text-[11px] text-primary">
                {total}
              </span>
            </Link>
            {TOOLS.map(([tool, label]) => (
              <Link
                key={tool}
                href={`${routes.browse}?tool=${tool}`}
                className="inline-flex shrink-0 items-center gap-2 border-b-2 border-transparent px-[18px] py-3.5 text-[13px] font-medium whitespace-nowrap text-fg-muted transition-colors hover:text-foreground"
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: toolColors[tool] }}
                />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Trending ────────────────────────────────────────── */}
      <section className="border-b border-border py-12">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="flex items-center gap-2.5 text-[20px] font-semibold tracking-[-0.015em]">
                <Flame className="h-[18px] w-[18px] text-warn" />
                Trending this week
              </h2>
              <p className="mt-0.5 text-[13px] text-fg-dim">Based on installs, stars, and recency</p>
            </div>
            <Link href={`${routes.browse}?sort=trending`} className="inline-flex items-center gap-1 text-[13px] font-medium text-fg-muted transition-colors hover:text-foreground">
              See all trending <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {trending.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-border py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-bg-elev text-fg-dim">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="mb-1.5 text-[16px] font-medium">No assets yet</h3>
              <p className="mb-5 text-fg-dim">
                Be the first to publish →{' '}
                <Link href={routes.publish} className="text-primary underline">Publish now</Link>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {trending.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Recently published ──────────────────────────────── */}
      <section className="border-b border-border py-12">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="flex items-center gap-2.5 text-[20px] font-semibold tracking-[-0.015em]">
                <Clock className="h-[18px] w-[18px] text-fg-muted" />
                Recently published
              </h2>
              <p className="mt-0.5 text-[13px] text-fg-dim">Fresh assets from the community</p>
            </div>
            <Link href={`${routes.browse}?sort=newest`} className="inline-flex items-center gap-1 text-[13px] font-medium text-fg-muted transition-colors hover:text-foreground">
              See all recent <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recent.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
          </div>
        </div>
      </section>

      {/* ── Supported tools ─────────────────────────────────── */}
      <section className="py-12">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="mb-6">
            <h2 className="text-[20px] font-semibold tracking-[-0.015em]">Supported tools</h2>
            <p className="mt-0.5 text-[13px] text-fg-dim">One manifest, every surface</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {TOOLS.map(([tool, label]) => (
              <Link
                key={tool}
                href={routes.tool(tool)}
                className="flex items-center gap-3 rounded-[10px] border border-border bg-bg-elev p-4 transition-colors hover:border-border-hover"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-[14px] font-semibold"
                  style={{
                    background: `${toolColors[tool]}22`,
                    color: toolColors[tool],
                  }}
                >
                  {label[0]}
                </span>
                <div>
                  <div className="text-[13.5px] font-medium leading-snug">{label}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
