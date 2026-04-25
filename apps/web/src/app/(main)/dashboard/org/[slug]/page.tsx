"use client";

// Client component — needs auth context and interactive member management

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  Package,
  Download,
  Star,
  Trash2,
  UserMinus,
  Shield,
  ShieldOff,
  ExternalLink,
} from "lucide-react";
import {
  getOrg,
  getOrgMembers,
  getOrgPackages,
  addOrgMember,
  updateOrgMemberRole,
  removeOrgMember,
  deleteOrg,
} from "@/lib/api/orgs";
import { routes } from "@/lib/routes";
import { useAuth } from "@/context/auth-context";
import type { OrgDto, OrgMemberDto, PackageDto } from "@ruleshub/types";

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

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export default function OrgDashboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, token } = useAuth();

  const [org, setOrg] = useState<OrgDto | null>(null);
  const [members, setMembers] = useState<OrgMemberDto[]>([]);
  const [packages, setPackages] = useState<PackageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [actionTarget, setActionTarget] = useState<string | null>(null);

  const myRole = members.find((m) => m.user.username === user?.username)?.role;
  const canManage = myRole === "owner" || myRole === "admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [orgData, membersData, pkgsData] = await Promise.all([
        getOrg(slug),
        getOrgMembers(slug),
        getOrgPackages(slug, 1, 100),
      ]);
      setOrg(orgData);
      setMembers(membersData);
      setPackages(pkgsData.data);
    } catch {
      router.replace(routes.dashboard);
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !inviteUsername.trim()) return;
    setInviting(true);
    setInviteError("");
    try {
      await addOrgMember(slug, inviteUsername.trim(), token);
      setInviteUsername("");
      await load();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Failed to invite");
    } finally {
      setInviting(false);
    }
  }

  async function handleRoleToggle(member: OrgMemberDto) {
    if (!token) return;
    setActionTarget(member.user.username);
    try {
      const newRole = member.role === "admin" ? "member" : "admin";
      await updateOrgMemberRole(slug, member.user.username, newRole, token);
      await load();
    } finally {
      setActionTarget(null);
    }
  }

  async function handleRemoveMember(username: string) {
    if (!token) return;
    if (!window.confirm(`Remove ${username} from this organisation?`)) return;
    setActionTarget(username);
    try {
      await removeOrgMember(slug, username, token);
      await load();
    } finally {
      setActionTarget(null);
    }
  }

  async function handleDeleteOrg() {
    if (!token || !org) return;
    if (
      !window.confirm(
        `Delete "${org.displayName}"? This will remove all packages published under this organisation.`,
      )
    )
      return;
    try {
      await deleteOrg(slug, token);
      router.replace(routes.dashboard);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  const totalDownloads = packages.reduce((a, p) => a + p.totalDownloads, 0);
  const totalStars = packages.reduce((a, p) => a + p.stars, 0);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1240px] px-6 pb-16">
        <div className="py-8 space-y-4">
          <div className="h-8 w-56 animate-pulse rounded bg-bg-elev" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-[10px] border border-border bg-bg-elev"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!org) return null;

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
              {org.displayName}
            </h1>
            <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[11px] text-fg-dim">
              {org.slug}
            </span>
          </div>
          <p className="mt-1 text-fg-dim">
            Organisation dashboard
            {myRole && (
              <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[11px]">
                {myRole}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={routes.org(slug)}
            className="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-border px-3.5 text-[13px] font-medium transition-colors hover:bg-bg-elev"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View public page
          </Link>
          {myRole === "owner" && (
            <button
              onClick={handleDeleteOrg}
              className="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-destructive/40 px-3.5 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete org
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Packages" value={String(packages.length)} />
        <StatCard label="Downloads" value={fmtNum(totalDownloads)} />
        <StatCard label="Stars" value={totalStars.toLocaleString()} />
        <StatCard label="Members" value={String(org.memberCount)} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* Packages table */}
        <div>
          <h3 className="mb-3 text-[15px] font-semibold">Packages</h3>
          {packages.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-border py-12 text-center">
              <Package className="mx-auto mb-3 h-8 w-8 text-fg-dim" />
              <p className="text-fg-dim">No packages published yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[10px] border border-border bg-bg-elev">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-bg-elev-2">
                    {["Package", "Version", "Downloads", "Stars"].map(
                      (h, i) => (
                        <th
                          key={i}
                          className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-dim ${i >= 2 ? "text-right" : "text-left"}`}
                        >
                          {h}
                        </th>
                      ),
                    )}
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
                          href={routes.package(`${p.namespace}/${p.name}`)}
                          className="font-mono text-[13px] transition-colors hover:text-primary"
                        >
                          {p.namespace}/{p.name}
                        </Link>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Members panel */}
        <div>
          <h3 className="mb-3 text-[15px] font-semibold">Members</h3>

          {/* Invite form — owner/admin only */}
          {canManage && (
            <form onSubmit={handleInvite} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="GitHub username"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  className="h-[34px] flex-1 rounded-md border border-border bg-bg-elev px-3 font-mono text-[13px] outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={inviting || !inviteUsername.trim()}
                  className="inline-flex h-[34px] items-center gap-1.5 rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Users className="h-3.5 w-3.5" />
                  {inviting ? "Adding…" : "Add"}
                </button>
              </div>
              {inviteError && (
                <p className="mt-1.5 text-[12px] text-destructive">
                  {inviteError}
                </p>
              )}
            </form>
          )}

          <div className="overflow-hidden rounded-[10px] border border-border bg-bg-elev">
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

                {/* Actions — owner only, cannot act on themselves or other owners */}
                {myRole === "owner" &&
                  m.user.username !== user?.username &&
                  m.role !== "owner" && (
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => handleRoleToggle(m)}
                        disabled={actionTarget === m.user.username}
                        title={
                          m.role === "admin"
                            ? "Demote to member"
                            : "Promote to admin"
                        }
                        className="flex h-6 w-6 items-center justify-center rounded text-fg-dim transition-colors hover:bg-bg-elev-2 hover:text-foreground disabled:opacity-40"
                      >
                        {m.role === "admin" ? (
                          <ShieldOff className="h-3.5 w-3.5" />
                        ) : (
                          <Shield className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleRemoveMember(m.user.username)}
                        disabled={actionTarget === m.user.username}
                        title="Remove member"
                        className="flex h-6 w-6 items-center justify-center rounded text-fg-dim transition-colors hover:bg-bg-elev-2 hover:text-destructive disabled:opacity-40"
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
