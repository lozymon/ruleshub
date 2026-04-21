'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Search } from 'lucide-react';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.12-1.47-1.12-1.47-.91-.62.07-.61.07-.61 1.01.07 1.54 1.04 1.54 1.04.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.28.1-2.66 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.41.1 2.66.64.7 1.03 1.59 1.03 2.68 0 3.84-2.35 4.68-4.58 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
    </svg>
  );
}
import { useState, useEffect, useRef } from 'react';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && search.trim()) {
      router.push(`${routes.browse}?q=${encodeURIComponent(search.trim())}`);
    }
  }

  const navLinks = [
    { href: routes.browse, label: 'Browse' },
    { href: routes.leaderboard, label: 'Leaderboard' },
    { href: '/docs', label: 'Docs' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-[12px]">
      <div className="mx-auto flex h-14 max-w-[1240px] items-center gap-6 px-6">

        {/* Logo */}
        <Link href={routes.home} className="flex items-center gap-2 font-mono text-[15px] font-semibold tracking-tight shrink-0">
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[5px] bg-primary text-[13px] font-bold text-primary-foreground">
            R
          </span>
          ruleshub
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'rounded-md px-3 py-1.5 text-[13.5px] font-medium transition-colors',
                pathname === href || (href !== '/' && pathname.startsWith(href))
                  ? 'text-foreground'
                  : 'text-fg-muted hover:bg-bg-elev hover:text-foreground',
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">

          {/* Search */}
          <div className="relative hidden w-[300px] sm:block">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-dim" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              onFocus={() => !pathname.startsWith(routes.browse) && router.prefetch(routes.browse)}
              placeholder="Search packages..."
              className="h-[34px] w-full rounded-md border border-border bg-bg-elev pl-8 pr-12 text-[13px] text-foreground placeholder:text-fg-dim focus:border-border-hover focus:outline-none transition-colors"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] text-fg-dim">
              ⌘K
            </kbd>
          </div>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-bg-elev hover:text-foreground"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          {/* GitHub */}
          <a
            href="https://github.com/lozymon/ruleshub"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-bg-elev hover:text-foreground"
            aria-label="GitHub"
          >
            <GithubIcon className="h-4 w-4" />
          </a>

          {/* Sign in */}
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/v1/auth/github`}
            className="flex h-[34px] items-center gap-1.5 rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <GithubIcon className="h-3.5 w-3.5" />
            Sign in
          </a>
        </div>
      </div>
    </nav>
  );
}
