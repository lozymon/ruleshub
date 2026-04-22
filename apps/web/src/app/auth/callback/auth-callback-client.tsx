'use client';

// Handles redirect from API OAuth: /auth/callback?token=<jwt>
import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { routes } from '@/lib/routes';

export default function AuthCallbackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token = searchParams.get('token');
    if (!token) { router.replace(routes.home); return; }

    login(token)
      .then(() => router.replace(routes.dashboard))
      .catch(() => router.replace(routes.home));
  }, [login, router, searchParams]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-3 text-fg-muted">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
        Signing you in…
      </div>
    </div>
  );
}
