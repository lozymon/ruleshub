"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  Download,
  Star,
  Package,
  Eye,
  Trash2,
  Building2,
  Plus,
  ChevronRight,
  Key,
  Copy,
  Check,
} from "lucide-react";
import { searchPackages, yankVersion } from "@/lib/api/packages";
import { getMyOrgs, createOrg } from "@/lib/api/orgs";
import { listApiKeys, createApiKey, revokeApiKey } from "@/lib/api/api-keys";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { routes } from "@/lib/routes";
import { useAuth } from "@/context/auth-context";
import type { ApiKeyDto, OrgDto, PackageDto } from "@ruleshub/types";

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
  if (d < 1) return "today";
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [packages, setPackages] = useState<PackageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [yankingId, setYankingId] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  type OrgWithRole = OrgDto & { role: "owner" | "admin" | "member" };
  const [orgs, setOrgs] = useState<OrgWithRole[]>([]);
  const [showNewOrg, setShowNewOrg] = useState(false);
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [newOrgName, setNewOrgName] = useState("");
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [createOrgError, setCreateOrgError] = useState("");

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

  const fetchOrgs = useCallback(async () => {
    if (!token) return;
    const data = await getMyOrgs(token).catch(() => []);
    setOrgs(data);
  }, [token]);

  const [apiKeys, setApiKeys] = useState<ApiKeyDto[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);

  const fetchApiKeys = useCallback(async () => {
    if (!token) return;
    const data = await listApiKeys(token).catch(() => []);
    setApiKeys(data);
  }, [token]);

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !newKeyName.trim()) return;
    setCreatingKey(true);
    try {
      const created = await createApiKey(newKeyName.trim(), token);
      setNewKeySecret(created.key);
      setNewKeyName("");
      await fetchApiKeys();
    } finally {
      setCreatingKey(false);
    }
  }

  function handleRevokeKey(id: string) {
    if (!token) return;
    setPendingConfirm({
      title: "Revoke API key?",
      description: "Any CI/CD using it will stop working.",
      confirmLabel: "Revoke",
      onConfirm: async () => {
        setPendingConfirm(null);
        setRevokingKeyId(id);
        try {
          await revokeApiKey(id, token);
          await fetchApiKeys();
        } finally {
          setRevokingKeyId(null);
        }
      },
    });
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }

  // Only redirect when auth has resolved, there is no user, AND no stored token.
  // A stored token with no user means the API was unreachable — don't log the user out.
  const redirected = useRef(false);
  useEffect(() => {
    if (!authLoading && !user && !token && !redirected.current) {
      redirected.current = true;
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/v1"}/auth/github`;
    }
  }, [authLoading, user, token]);

  useEffect(() => {
    fetchPackages();
    fetchOrgs();
    fetchApiKeys();
  }, [fetchPackages, fetchOrgs, fetchApiKeys]);

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setCreateOrgError("You must be signed in to create an organisation.");
      return;
    }
    if (!newOrgSlug.trim() || !newOrgName.trim()) return;
    setCreatingOrg(true);
    setCreateOrgError("");
    try {
      await createOrg(
        { slug: newOrgSlug.trim(), displayName: newOrgName.trim() },
        token,
      );
      setNewOrgSlug("");
      setNewOrgName("");
      setShowNewOrg(false);
      await fetchOrgs();
    } catch (err) {
      setCreateOrgError(
        err instanceof Error ? err.message : "Failed to create organisation",
      );
    } finally {
      setCreatingOrg(false);
    }
  }

  function handleYank(pkg: PackageDto) {
    if (!token || !pkg.latestVersion) return;
    setPendingConfirm({
      title: `Yank ${pkg.namespace}/${pkg.name}@${pkg.latestVersion.version}?`,
      description: "This removes it from the registry and cannot be undone.",
      confirmLabel: "Yank",
      onConfirm: async () => {
        setPendingConfirm(null);
        setYankingId(pkg.id);
        try {
          await yankVersion(
            pkg.namespace,
            pkg.name,
            pkg.latestVersion!.version,
            token,
          );
          await fetchPackages();
        } finally {
          setYankingId(null);
        }
      },
    });
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
            {user ? `Signed in as ${user.username}` : "Loading…"}
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
                    "Package",
                    "Type",
                    "Version",
                    "Downloads",
                    "Stars",
                    "Updated",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-dim ${i >= 3 && i <= 4 ? "text-right" : "text-left"}`}
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
                        href={routes.package(p.namespace + "/" + p.name)}
                        className="font-mono text-[13px] hover:text-primary transition-colors"
                      >
                        {p.namespace}/{p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-fg-muted">
                      {p.type}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[13px]">
                      {p.latestVersion ? `v${p.latestVersion.version}` : "—"}
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
                          href={routes.package(p.namespace + "/" + p.name)}
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
                              : "No versions"
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

      {/* Organisations */}
      <div className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold">Organisations</h3>
          <button
            onClick={() => setShowNewOrg((v) => !v)}
            className="inline-flex h-[30px] items-center gap-1.5 rounded-md border border-border px-3 text-[12px] font-medium transition-colors hover:bg-bg-elev"
          >
            <Plus className="h-3 w-3" />
            New organisation
          </button>
        </div>

        {showNewOrg && (
          <form
            onSubmit={handleCreateOrg}
            className="mb-4 rounded-[10px] border border-border bg-bg-elev p-4"
          >
            <p className="mb-3 text-[13px] font-medium">Create organisation</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                placeholder="slug (e.g. acmecorp)"
                value={newOrgSlug}
                onChange={(e) =>
                  setNewOrgSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  )
                }
                className="h-[34px] flex-1 rounded-md border border-border bg-background px-3 font-mono text-[13px] outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="Display name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                className="h-[34px] flex-1 rounded-md border border-border bg-background px-3 text-[13px] outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={
                  creatingOrg || !newOrgSlug.trim() || !newOrgName.trim()
                }
                className="inline-flex h-[34px] items-center gap-1.5 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {creatingOrg ? "Creating…" : "Create"}
              </button>
            </div>
            {createOrgError && (
              <p className="mt-2 text-[12px] text-destructive">
                {createOrgError}
              </p>
            )}
          </form>
        )}

        {orgs.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-border py-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-bg-elev">
              <Building2 className="h-5 w-5 text-fg-dim" />
            </div>
            <p className="text-[13px] text-fg-dim">
              No organisations yet. Create one to publish packages under a team
              namespace.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[10px] border border-border bg-bg-elev">
            {orgs.map((org, i) => (
              <Link
                key={org.id}
                href={routes.dashboardOrg(org.slug)}
                className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-elev-2 ${i < orgs.length - 1 ? "border-b border-border" : ""}`}
              >
                {org.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={org.avatarUrl}
                    alt={org.displayName}
                    className="h-7 w-7 rounded-lg border border-border"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 font-mono text-[11px] font-bold text-primary">
                    {org.displayName[0]?.toUpperCase()}
                  </div>
                )}
                <span className="flex-1 text-[13px] font-medium">
                  {org.displayName}
                </span>
                <span className="font-mono text-[12px] text-fg-dim">
                  {org.slug}
                </span>
                <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-fg-dim">
                  {org.role}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-fg-dim" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* API Keys */}
      <div className="mt-10">
        <h3 className="mb-3 text-[15px] font-semibold">API Keys</h3>
        <p className="mb-4 text-[13px] text-fg-dim">
          Use these tokens to publish packages from CI/CD without a browser
          login. Set{" "}
          <code className="rounded bg-bg-elev px-1 font-mono text-[12px]">
            RULESHUB_TOKEN=&lt;key&gt;
          </code>{" "}
          in your environment.
        </p>

        {/* New key revealed — show once */}
        {newKeySecret && (
          <div className="mb-4 rounded-[10px] border border-primary/30 bg-primary/5 p-4">
            <p className="mb-2 text-[13px] font-medium text-primary">
              Copy your key now — it won&apos;t be shown again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded-md border border-border bg-bg-elev px-3 py-2 font-mono text-[12px]">
                {newKeySecret}
              </code>
              <button
                onClick={() => copyKey(newKeySecret)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-bg-elev transition-colors hover:bg-bg-elev-2"
                title="Copy to clipboard"
              >
                {copiedKey ? (
                  <Check className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <button
              onClick={() => setNewKeySecret(null)}
              className="mt-2 text-[12px] text-fg-dim underline-offset-2 hover:underline"
            >
              I&apos;ve saved it, dismiss
            </button>
          </div>
        )}

        {/* Create form */}
        <form onSubmit={handleCreateKey} className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Key name (e.g. GitHub Actions)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="h-[34px] flex-1 rounded-md border border-border bg-bg-elev px-3 text-[13px] outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={creatingKey || !newKeyName.trim()}
            className="inline-flex h-[34px] items-center gap-1.5 rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            {creatingKey ? "Creating…" : "New key"}
          </button>
        </form>

        {apiKeys.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-border py-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-bg-elev">
              <Key className="h-5 w-5 text-fg-dim" />
            </div>
            <p className="text-[13px] text-fg-dim">No API keys yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[10px] border border-border bg-bg-elev">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg-elev-2">
                  {["Name", "Prefix", "Last used", "Created", ""].map(
                    (h, i) => (
                      <th
                        key={i}
                        className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-dim ${i === 0 ? "text-left" : i < 4 ? "text-left" : "text-right"}`}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((k) => (
                  <tr
                    key={k.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-bg-elev-2"
                  >
                    <td className="px-4 py-3.5 text-[13px] font-medium">
                      {k.name}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[12px] text-fg-dim">
                      {k.prefix}…
                    </td>
                    <td className="px-4 py-3.5 text-[12.5px] text-fg-dim">
                      {k.lastUsedAt
                        ? new Date(k.lastUsedAt).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-4 py-3.5 text-[12.5px] text-fg-dim">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleRevokeKey(k.id)}
                        disabled={revokingKeyId === k.id}
                        title="Revoke key"
                        className="flex h-7 w-7 items-center justify-center rounded text-fg-muted transition-colors hover:bg-bg-elev hover:text-destructive disabled:opacity-40 ml-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingConfirm}
        title={pendingConfirm?.title ?? ""}
        description={pendingConfirm?.description ?? ""}
        confirmLabel={pendingConfirm?.confirmLabel ?? "Confirm"}
        destructive
        onConfirm={() => pendingConfirm?.onConfirm()}
        onCancel={() => setPendingConfirm(null)}
      />
    </div>
  );
}
