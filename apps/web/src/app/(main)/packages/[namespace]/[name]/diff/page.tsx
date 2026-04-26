import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowRight, Minus, Plus, RefreshCw } from "lucide-react";
import { getPackageDiff } from "@/lib/api/packages";
import { routes } from "@/lib/routes";
import type { DiffChange, DiffChangeKind } from "@ruleshub/types";

interface DiffPageProps {
  params: Promise<{ namespace: string; name: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}

function kindIcon(kind: DiffChangeKind) {
  if (kind === "added") return <Plus className="h-3.5 w-3.5 text-success" />;
  if (kind === "removed")
    return <Minus className="h-3.5 w-3.5 text-destructive" />;
  if (kind === "changed")
    return <RefreshCw className="h-3.5 w-3.5 text-[var(--warn)]" />;
  return null;
}

function kindBadge(kind: DiffChangeKind) {
  const base =
    "rounded-[3px] px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase";
  if (kind === "added")
    return `${base} bg-success/10 text-success border border-success/30`;
  if (kind === "removed")
    return `${base} bg-destructive/10 text-destructive border border-destructive/30`;
  if (kind === "changed")
    return `${base} bg-[var(--warn)]/10 text-[var(--warn)] border border-[var(--warn)]/30`;
  return `${base} bg-bg-elev-2 text-fg-dim border border-border`;
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return String(value);
}

function ChangeRow({ change }: { change: DiffChange }) {
  const { field, kind, fromValue, toValue } = change;
  const isUnchanged = kind === "unchanged";

  return (
    <div
      className={`grid grid-cols-[160px_1fr] gap-0 border-b border-border last:border-0 ${isUnchanged ? "opacity-40" : ""}`}
    >
      <div className="flex items-start gap-2 border-r border-border px-4 py-3">
        <span className="mt-0.5">{kindIcon(kind)}</span>
        <div>
          <span className="font-mono text-[12px] text-foreground">{field}</span>
          <div className="mt-1">
            <span className={kindBadge(kind)}>{kind}</span>
          </div>
        </div>
      </div>

      {kind === "unchanged" ? (
        <div className="px-4 py-3 font-mono text-[12.5px] text-fg-dim">
          {renderValue(fromValue)}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {kind !== "added" && (
            <div className="flex items-start gap-2 bg-destructive/5 px-4 py-2.5">
              <span className="mt-0.5 font-mono text-[11px] font-bold text-destructive">
                −
              </span>
              <span className="font-mono text-[12.5px] text-destructive/80 line-through decoration-destructive/40">
                {renderValue(fromValue)}
              </span>
            </div>
          )}
          {kind !== "removed" && (
            <div className="flex items-start gap-2 bg-success/5 px-4 py-2.5">
              <span className="mt-0.5 font-mono text-[11px] font-bold text-success">
                +
              </span>
              <span className="font-mono text-[12.5px] text-success/90">
                {renderValue(toValue)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default async function DiffPage({
  params,
  searchParams,
}: DiffPageProps) {
  const { namespace, name } = await params;
  const { from, to } = await searchParams;

  if (!from || !to) {
    notFound();
  }

  let diff;
  try {
    diff = await getPackageDiff(namespace, name, from, to);
  } catch {
    notFound();
  }

  const changed = diff.changes.filter((c) => c.kind !== "unchanged");
  const unchanged = diff.changes.filter((c) => c.kind === "unchanged");

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 py-3.5 font-mono text-[12px] text-fg-dim">
        <Link
          href={routes.browse}
          className="text-fg-muted hover:text-foreground transition-colors"
        >
          browse
        </Link>
        <ChevronRight className="h-2.5 w-2.5" />
        <Link
          href={routes.user(namespace)}
          className="text-fg-muted hover:text-foreground transition-colors"
        >
          {namespace}
        </Link>
        <ChevronRight className="h-2.5 w-2.5" />
        <Link
          href={routes.package(`${namespace}/${name}`)}
          className="text-fg-muted hover:text-foreground transition-colors"
        >
          {name}
        </Link>
        <ChevronRight className="h-2.5 w-2.5" />
        <span className="text-foreground">diff</span>
      </div>

      {/* Header */}
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">
          Version diff
        </h1>
        <div className="mt-2 flex items-center gap-2 font-mono text-[14px] text-fg-muted">
          <span className="rounded-[4px] border border-border bg-bg-elev px-2 py-0.5">
            v{from}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-fg-dim" />
          <span className="rounded-[4px] border border-[var(--rh-accent-border)] bg-[var(--rh-accent-tint)] px-2 py-0.5 text-primary">
            v{to}
          </span>
          <span className="ml-2 text-[13px] text-fg-dim">
            {changed.length === 0
              ? "No changes"
              : `${changed.length} field${changed.length === 1 ? "" : "s"} changed`}
          </span>
        </div>
      </div>

      {changed.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-border py-16 text-center">
          <p className="text-[15px] font-medium">Identical manifests</p>
          <p className="mt-1 text-[13px] text-fg-dim">
            No manifest fields changed between these two versions.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Changed fields */}
          <div>
            <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-fg-dim">
              Changes
            </h2>
            <div className="overflow-hidden rounded-[10px] border border-border bg-bg-elev">
              {changed.map((c) => (
                <ChangeRow key={c.field} change={c} />
              ))}
            </div>
          </div>

          {/* Unchanged fields — collapsed by default */}
          {unchanged.length > 0 && (
            <details className="group">
              <summary className="mb-3 flex cursor-pointer list-none items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-fg-dim hover:text-fg-muted">
                <span className="transition-transform group-open:rotate-90">
                  ▶
                </span>
                Unchanged ({unchanged.length})
              </summary>
              <div className="overflow-hidden rounded-[10px] border border-border bg-bg-elev">
                {unchanged.map((c) => (
                  <ChangeRow key={c.field} change={c} />
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
