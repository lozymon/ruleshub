import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  BookOpen,
  History,
  FileText,
  MessageSquare,
} from "lucide-react";
import { getPackage, getPackagePreview } from "@/lib/api/packages";
import { InstallBlock } from "@/components/packages/install-block";
import { StarButton } from "@/components/packages/star-button";
import { ToolBadge } from "@/components/ui/tool-badge";
import { QualityBadge } from "@/components/ui/quality-badge";
import { BadgeSnippets } from "@/components/packages/badge-snippets";
import { FilePreviewTabs } from "@/components/packages/file-preview-tabs";
import { config } from "@/lib/config";
import { routes } from "@/lib/routes";

interface PackagePageProps {
  params: Promise<{ namespace: string; name: string }>;
}

const TYPE_ICONS: Record<string, string> = {
  rule: "📄",
  command: ">_",
  workflow: "⇢",
  agent: "◉",
  mcp: "⬡",
  pack: "▣",
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diffMs / 3_600_000);
  const d = Math.floor(diffMs / 86_400_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

export default async function PackagePage({ params }: PackagePageProps) {
  const { namespace, name } = await params;

  let pkg;
  try {
    pkg = await getPackage(namespace, name);
  } catch {
    notFound();
  }

  const latestVersion = pkg.latestVersion?.version ?? null;
  const preview = latestVersion
    ? await getPackagePreview(namespace, name, latestVersion).catch(() => null)
    : null;

  const version = latestVersion;
  const downloads =
    pkg.totalDownloads >= 1_000_000
      ? `${(pkg.totalDownloads / 1_000_000).toFixed(1)}M`
      : pkg.totalDownloads >= 1_000
        ? `${(pkg.totalDownloads / 1_000).toFixed(1)}k`
        : String(pkg.totalDownloads);

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
        <span className="text-foreground">{name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] border border-border bg-bg-elev text-[26px] text-fg-muted">
          {TYPE_ICONS[pkg.type] ?? "□"}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="flex flex-wrap items-center gap-2 font-mono text-[24px] font-semibold tracking-[-0.02em]">
            <span className="text-fg-muted font-medium">{namespace}/</span>
            <span>{name}</span>
            {pkg.owner.verified && (
              <span
                className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground"
                title="Verified publisher"
              >
                ✓
              </span>
            )}
            <span className="rounded-[3px] border border-border bg-bg-elev-2 px-1.5 py-0.5 font-mono text-[10.5px] font-medium lowercase text-fg-muted">
              {pkg.type}
            </span>
          </h1>

          <p className="mt-2 max-w-[700px] text-[14.5px] text-fg-muted">
            {pkg.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3.5 text-[13px] text-fg-dim">
            <Link
              href={routes.user(namespace)}
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/50 font-mono text-[10px] font-semibold text-white">
                {namespace[0]?.toUpperCase()}
              </span>
              {namespace}
            </Link>
            {version && (
              <>
                <span>·</span>
                <span className="font-mono">v{version}</span>
              </>
            )}
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              updated {timeAgo(pkg.updatedAt)}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Download className="h-3 w-3" />
              {downloads} installs
            </span>
            <span>·</span>
            <div className="flex flex-wrap gap-1.5">
              {pkg.supportedTools.map((t) => (
                <ToolBadge key={t} tool={t} />
              ))}
            </div>
            <span>·</span>
            <QualityBadge score={pkg.qualityScore} size="md" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <StarButton initialStars={pkg.stars} />
          <a
            href={`/api/packages/${namespace}/${name}/download`}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border-strong bg-bg-elev px-3 text-[13px] font-medium text-foreground transition-colors hover:border-border-hover"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
          {version && (
            <span className="inline-flex h-8 items-center rounded-md border border-border-strong bg-bg-elev px-3 font-mono text-[13px] text-foreground">
              v{version}
            </span>
          )}
        </div>
      </div>

      {/* Install block */}
      <div className="mt-6">
        <InstallBlock
          namespace={namespace}
          name={name}
          firstTool={pkg.supportedTools[0] ?? null}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        {/* Main content — tabs */}
        <div>
          {/* Tab bar */}
          <div className="flex border-b border-border">
            {(
              [
                { id: "readme", label: "README", Icon: BookOpen },
                { id: "versions", label: "Versions", Icon: History },
                { id: "files", label: "Files", Icon: FileText },
                { id: "comments", label: "Comments", Icon: MessageSquare },
              ] as const
            ).map(({ id, label, Icon }, i) => (
              <button
                key={id}
                className={`inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-[13px] font-medium transition-colors ${
                  i === 0
                    ? "border-primary text-foreground"
                    : "border-transparent text-fg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* README content (default tab — static for now) */}
          <div className="prose-readme py-6">
            <h1>
              {namespace}/{name}
            </h1>
            <p>{pkg.description}</p>
            <h2>Installation</h2>
            <pre>
              <code>{`npx ruleshub install ${namespace}/${name}`}</code>
            </pre>
            <p>
              The CLI writes the appropriate files per detected tool — Claude
              Code receives a <code>CLAUDE.md</code> delta, Cursor gets{" "}
              <code>.cursor/rules/*.mdc</code>, and Copilot gets{" "}
              <code>.github/copilot-instructions.md</code>.
            </p>
            <h2>Supported tools</h2>
            <ul>
              {pkg.supportedTools.map((t) => (
                <li key={t}>
                  <code>{t}</code>
                </li>
              ))}
            </ul>
          </div>

          {/* Files preview */}
          {preview && preview.previews.length > 0 && (
            <div className="mt-2 border-t border-border pt-6">
              <h3 className="mb-4 text-[14px] font-semibold">Files</h3>
              <FilePreviewTabs previews={preview.previews} />
            </div>
          )}

          {/* Versions */}
          <div className="mt-2 border-t border-border pt-6">
            <h3 className="mb-4 text-[14px] font-semibold">Versions</h3>
            {pkg.versions.length === 0 ? (
              <p className="text-[13px] text-fg-muted">
                No versions published yet.
              </p>
            ) : (
              <div className="overflow-hidden rounded-[10px] border border-border bg-bg-elev">
                {pkg.versions.map((v, i) => (
                  <div
                    key={v.id}
                    className={
                      i < pkg.versions.length - 1
                        ? "border-b border-border"
                        : ""
                    }
                  >
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      <span className="flex-1 font-mono text-[13px]">
                        {v.version}
                        {i === 0 && (
                          <span className="ml-2 rounded-[3px] border border-[var(--rh-accent-border)] bg-[var(--rh-accent-tint)] px-1.5 py-0.5 font-mono text-[10px] text-primary">
                            LATEST
                          </span>
                        )}
                        {v.yanked && (
                          <span className="ml-2 rounded-[3px] border border-destructive/40 bg-destructive/10 px-1.5 py-0.5 font-mono text-[10px] text-destructive">
                            YANKED
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-[12px] text-fg-dim">
                        {v.downloads.toLocaleString()} installs
                      </span>
                      <span className="text-[12px] text-fg-dim">
                        {new Date(v.publishedAt).toLocaleDateString()}
                      </span>
                      {i > 0 && pkg.versions[0] && (
                        <Link
                          href={routes.packageDiff(
                            `${namespace}/${name}`,
                            v.version,
                            pkg.versions[0].version,
                          )}
                          className="font-mono text-[11px] text-fg-dim transition-colors hover:text-primary"
                        >
                          diff →latest
                        </Link>
                      )}
                    </div>
                    {v.changelog && (
                      <details className="group px-4 pb-3">
                        <summary className="cursor-pointer list-none text-[12px] text-fg-dim hover:text-foreground">
                          <span className="inline-flex items-center gap-1">
                            <span className="transition-transform group-open:rotate-90">
                              ▶
                            </span>
                            Changelog
                          </span>
                        </summary>
                        <p className="mt-2 whitespace-pre-wrap rounded-md border border-border bg-bg-elev-2 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-fg-muted">
                          {v.changelog}
                        </p>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 pt-[53px]">
          {/* Stats */}
          <div className="rounded-lg border border-border bg-bg-elev p-4">
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
              Stats
            </h4>
            <div className="flex justify-between py-1.5 text-[13px] border-b border-border">
              <span className="text-fg-muted">Quality score</span>
              <QualityBadge score={pkg.qualityScore} />
            </div>
            {[
              {
                label: "Total downloads",
                value: pkg.totalDownloads.toLocaleString(),
              },
              { label: "Stars", value: pkg.stars.toLocaleString() },
              { label: "Latest version", value: version ? `v${version}` : "—" },
              { label: "Type", value: pkg.type },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between py-1.5 text-[13px] border-b border-border last:border-0"
              >
                <span className="text-fg-muted">{label}</span>
                <span className="font-mono text-foreground">{value}</span>
              </div>
            ))}
          </div>

          {/* Repository */}
          <div className="rounded-lg border border-border bg-bg-elev p-4">
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
              Repository
            </h4>
            {[
              {
                label: `github.com/${namespace}/${name}`,
                href: `https://github.com/${namespace}/${name}`,
              },
              {
                label: "Report issue",
                href: `https://github.com/${namespace}/${name}/issues`,
              },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-1.5 text-[13px] text-fg-muted transition-colors hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                {label}
              </a>
            ))}
          </div>

          {/* License */}
          <div className="rounded-lg border border-border bg-bg-elev p-4">
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
              License
            </h4>
            <span className="font-mono text-[13px]">MIT</span>
          </div>

          {/* Tools */}
          <div className="rounded-lg border border-border bg-bg-elev p-4">
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
              Supported tools
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {pkg.supportedTools.map((t) => (
                <ToolBadge key={t} tool={t} />
              ))}
            </div>
          </div>

          {/* README Badges */}
          <div className="rounded-lg border border-border bg-bg-elev p-4">
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
              README badges
            </h4>
            <BadgeSnippets
              versionUrl={`${config.apiUrl}/badges/${namespace}/${name}/version`}
              downloadsUrl={`${config.apiUrl}/badges/${namespace}/${name}/downloads`}
              fullName={pkg.fullName}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
