"use client";

// Confirms the API set the httpOnly auth cookie and redirects to the dashboard.
// The previous flow received the JWT via `?token=` in the URL — that leaked
// the credential into history, Referer headers, and any third-party scripts on
// this page. The API now sets the cookie directly; this page just verifies
// the session and routes.
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { routes } from "@/lib/routes";

export default function AuthCallbackClient() {
  const router = useRouter();
  const { login } = useAuth();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    login()
      .then(() => router.replace(routes.dashboard))
      .catch(() => router.replace(routes.home));
  }, [login, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-3 text-fg-muted">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
        Signing you in…
      </div>
    </div>
  );
}
