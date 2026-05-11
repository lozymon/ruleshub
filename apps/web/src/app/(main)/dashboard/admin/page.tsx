"use client";
// Needs client for interactive table actions (block/verify toggles + pagination)

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Shield, Search, UserX, UserCheck, BadgeCheck } from "lucide-react";
import {
  listAdminUsers,
  setUserVerified,
  setUserBlocked,
  type AdminUserDto,
} from "@/lib/api/admin";
import { useAuth } from "@/context/auth-context";
import { routes } from "@/lib/routes";
import { config } from "@/lib/config";

const LIMIT = 50;

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const load = useCallback(
    async (nextPage: number, search: string) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const res = await listAdminUsers(nextPage, LIMIT, search || undefined);
        setUsers(res.data);
        setTotal(res.total);
        setPage(nextPage);
      } catch {
        setError("Failed to load users");
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    },
    [user],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(1, q);
  };

  const toggleVerified = async (u: AdminUserDto) => {
    if (!user) return;
    const next = !u.verified;
    setUsers((prev) =>
      prev.map((x) => (x.id === u.id ? { ...x, verified: next } : x)),
    );
    try {
      await setUserVerified(u.username, next);
    } catch {
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, verified: u.verified } : x)),
      );
    }
  };

  const toggleBlocked = async (u: AdminUserDto) => {
    if (!user) return;
    const next = !u.blocked;
    setUsers((prev) =>
      prev.map((x) => (x.id === u.id ? { ...x, blocked: next } : x)),
    );
    try {
      await setUserBlocked(u.username, next);
    } catch {
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, blocked: u.blocked } : x)),
      );
    }
  };

  // Redirects happen out of render to avoid the "side effect during render"
  // warning. Anonymous visitors are pushed through the API's OAuth flow;
  // logged-in non-admins are bounced back to the regular dashboard.
  const redirected = useRef(false);
  useEffect(() => {
    if (authLoading || redirected.current) return;
    if (!user) {
      redirected.current = true;
      window.location.href = `${config.apiUrl}/auth/github`;
      return;
    }
    if (!user.isAdmin) {
      redirected.current = true;
      router.replace(routes.dashboard);
    }
  }, [authLoading, user, router]);

  // Render-time gate. Strict admin check — even if a non-admin somehow
  // landed here while the redirect is in flight, they see nothing.
  if (authLoading || !user || !user.isAdmin) return null;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Shield className="size-6 text-fg-dim" />
        <h1 className="text-[22px] font-semibold tracking-tight">
          Admin — Users
        </h1>
        {total > 0 && (
          <span className="ml-auto text-sm text-fg-dim">{total} total</span>
        )}
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-dim" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by username…"
            className="w-full rounded-[8px] border border-border bg-bg-elev py-2 pl-9 pr-3 text-sm outline-none placeholder:text-fg-dim focus:border-fg-dim"
          />
        </div>
        <button
          type="submit"
          className="rounded-[8px] bg-fg px-4 py-2 text-sm font-medium text-bg"
        >
          Search
        </button>
      </form>

      {!initialized && (
        <div className="py-16 text-center text-sm text-fg-dim">
          Enter a search term or{" "}
          <button
            onClick={() => load(1, "")}
            className="text-fg underline underline-offset-2"
          >
            load all users
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-[8px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {initialized && users.length === 0 && !loading && (
        <div className="py-16 text-center text-sm text-fg-dim">
          No users found
        </div>
      )}

      {users.length > 0 && (
        <div className="overflow-hidden rounded-[10px] border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-elev text-left text-xs font-medium uppercase tracking-[0.06em] text-fg-dim">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Packages</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-center">Verified</th>
                <th className="px-4 py-3 text-center">Blocked</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  className={`border-b border-border last:border-0 ${
                    u.blocked ? "opacity-50" : ""
                  } ${i % 2 === 0 ? "" : "bg-bg-elev/40"}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {u.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.avatarUrl}
                          alt=""
                          className="size-7 rounded-full"
                        />
                      ) : (
                        <div className="size-7 rounded-full bg-bg-elev" />
                      )}
                      <span className="font-medium">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-fg-dim">
                    {u.packageCount}
                  </td>
                  <td className="px-4 py-3 text-fg-dim">
                    {timeAgo(u.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleVerified(u)}
                      title={u.verified ? "Unverify" : "Verify"}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                        u.verified
                          ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                          : "bg-border/60 text-fg-dim hover:bg-border"
                      }`}
                    >
                      <BadgeCheck className="size-3" />
                      {u.verified ? "Verified" : "Unverified"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleBlocked(u)}
                      title={u.blocked ? "Unblock" : "Block"}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                        u.blocked
                          ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                          : "bg-border/60 text-fg-dim hover:bg-border"
                      }`}
                    >
                      {u.blocked ? (
                        <UserX className="size-3" />
                      ) : (
                        <UserCheck className="size-3" />
                      )}
                      {u.blocked ? "Blocked" : "Active"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-fg-dim">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => load(page - 1, q)}
              className="rounded-[6px] border border-border px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => load(page + 1, q)}
              className="rounded-[6px] border border-border px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
