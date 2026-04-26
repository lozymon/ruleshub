"use client"; // keyboard shortcuts, dynamic script load, controlled input

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";

interface PagefindResult {
  url: string;
  meta: { title: string };
  excerpt: string;
}

interface PagefindModule {
  init: () => Promise<void>;
  search: (
    query: string,
  ) => Promise<{ results: { data: () => Promise<PagefindResult> }[] }>;
}

let cached: PagefindModule | null = null;

async function loadPagefind(): Promise<PagefindModule | null> {
  if (cached) return cached;
  try {
    // new Function bypasses both webpack bundling and TS module resolution —
    // /_pagefind/pagefind.js is generated at build time by the pagefind CLI
    const pf = (await new Function(
      'return import("/_pagefind/pagefind.js")',
    )()) as PagefindModule;
    await pf.init();
    cached = pf;
    return cached;
  } catch {
    return null;
  }
}

export function DocsSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PagefindResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        isOpen ? close() : open();
      }
      if (e.key === "Escape" && isOpen) close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, open, close]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    loadPagefind().then(async (pf) => {
      if (!pf || cancelled) return;
      const res = await pf.search(query);
      const data = await Promise.all(
        res.results.slice(0, 8).map((r) => r.data()),
      );
      if (!cancelled) {
        setResults(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
      setLoading(false);
    };
  }, [query]);

  return (
    <>
      <button
        onClick={open}
        aria-label="Search documentation"
        className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search docs</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium opacity-60">
          ⌘K
        </kbd>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={close}
            aria-hidden="true"
          />
          <div className="fixed left-1/2 top-24 z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border border-border bg-background shadow-2xl">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search documentation…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <button
                onClick={close}
                aria-label="Close search"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {results.length > 0 && (
              <ul className="max-h-96 overflow-y-auto py-2">
                {results.map((r, i) => (
                  <li key={i}>
                    <a
                      href={r.url}
                      onClick={close}
                      className="flex flex-col gap-1 px-4 py-3 hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm font-medium">
                        {r.meta.title}
                      </span>
                      <span
                        className="text-xs text-muted-foreground line-clamp-2 [&_mark]:bg-transparent [&_mark]:text-foreground [&_mark]:font-medium"
                        dangerouslySetInnerHTML={{ __html: r.excerpt }}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {query && !loading && results.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No results for &ldquo;{query}&rdquo;
              </p>
            )}

            {!query && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                Type to search documentation…
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}
