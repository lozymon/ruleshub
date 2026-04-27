"use client"; // keyboard shortcuts, dynamic script load, controlled input

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { docNav } from "@/docs/nav";

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
let pagefindUnavailable = false;

async function loadPagefind(): Promise<PagefindModule | null> {
  if (pagefindUnavailable) return null;
  if (cached) return cached;
  try {
    const pf = (await new Function(
      'return import("/_pagefind/pagefind.js")',
    )()) as PagefindModule;
    await pf.init();
    cached = pf;
    return cached;
  } catch {
    pagefindUnavailable = true;
    return null;
  }
}

// Nav-based fallback for dev / pre-build environments
function navSearch(query: string): PagefindResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return docNav
    .flatMap((section) =>
      section.pages.map((page) => ({
        url: `/docs/${page.slug}`,
        meta: { title: page.title },
        excerpt: `<span>${section.title}</span>`,
        _score: page.title.toLowerCase().includes(q)
          ? page.title.toLowerCase().startsWith(q)
            ? 2
            : 1
          : 0,
      })),
    )
    .filter((r) => r._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 8);
}

export function DocsSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PagefindResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
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
      if (cancelled) return;

      if (!pf) {
        // Pagefind not available — use nav title search
        setUsingFallback(true);
        setResults(navSearch(query));
        setLoading(false);
        return;
      }

      setUsingFallback(false);
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
        className="relative flex h-8 w-full items-center rounded-[6px] border border-border bg-bg-elev text-left transition-colors hover:border-border-hover"
      >
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-[13px] w-[13px] text-fg-dim" />
        <span className="flex-1 pl-8 pr-10 text-[12.5px] text-fg-dim">
          Search docs...
        </span>
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-fg-dim border border-border rounded-[3px] px-[5px] py-px">
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

            {usingFallback && results.length > 0 && (
              <p className="border-t border-border px-4 py-2 text-center text-[11px] text-fg-faint">
                Title search only — run{" "}
                <code className="font-mono">pnpm build</code> for full-text
                search
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}
