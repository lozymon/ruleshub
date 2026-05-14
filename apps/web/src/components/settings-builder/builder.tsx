"use client";

// Client-side: the page is an interactive scratchpad (paste JSON, see it
// rendered against the catalogue). No data fetching, no server state.

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, X } from "lucide-react";
import type {
  SettingCategory,
  SettingEntry,
  SettingScope,
} from "@/lib/settings-catalogue";
import { cn } from "@/lib/utils";

type ParseResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; error: string };

function tryParse(raw: string): ParseResult | null {
  if (!raw.trim()) return null;
  try {
    const v: unknown = JSON.parse(raw);
    if (v === null || typeof v !== "object" || Array.isArray(v)) {
      return { ok: false, error: "Top-level value must be a JSON object." };
    }
    return { ok: true, value: v as Record<string, unknown> };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Invalid JSON.",
    };
  }
}

const SAMPLE = `{
  "model": "claude-sonnet-4-6",
  "permissions": {
    "allow": ["Read(*)", "Bash(npm run *)"],
    "deny": ["Bash(rm -rf *)"]
  },
  "hooks": {
    "Stop": [
      { "hooks": [{ "type": "command", "command": "echo done" }] }
    ]
  },
  "includeCoAuthoredBy": false,
  "statusLine": { "type": "command", "command": "~/.claude/statusline.sh" }
}`;

export function SettingsBuilder({
  categories,
}: {
  categories: SettingCategory[];
}) {
  const [rawJson, setRawJson] = useState("");
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => tryParse(rawJson), [rawJson]);

  const knownKeys = useMemo(() => {
    const set = new Set<string>();
    for (const cat of categories) for (const s of cat.settings) set.add(s.key);
    return set;
  }, [categories]);

  const customKeys = useMemo(() => {
    if (parsed?.ok !== true) return [];
    return Object.keys(parsed.value).filter((k) => !knownKeys.has(k));
  }, [parsed, knownKeys]);

  async function copyJson() {
    if (!rawJson) return;
    await navigator.clipboard.writeText(rawJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
      {/* LEFT — JSON pane (sticky on desktop) */}
      <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:max-h-[calc(100vh-4rem)]">
        <div className="flex items-center gap-2 text-[12px] text-fg-dim">
          <span className="font-mono font-medium text-fg-muted">
            settings.json
          </span>
          {parsed && (
            <span
              className={cn(
                "ml-auto rounded-[3px] px-1.5 py-0.5 font-mono text-[10.5px]",
                parsed.ok
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400",
              )}
            >
              {parsed.ok
                ? `${Object.keys(parsed.value).length} keys`
                : "invalid JSON"}
            </span>
          )}
        </div>
        <textarea
          value={rawJson}
          onChange={(e) => setRawJson(e.target.value)}
          placeholder="Paste your .claude/settings.json here…"
          spellCheck={false}
          aria-label="settings.json content"
          className="min-h-[420px] flex-1 resize-none rounded-[4px] border border-border bg-bg-elev p-3 font-mono text-[12.5px] leading-relaxed outline-none transition-colors focus:border-border-hover"
        />
        {parsed?.ok === false && (
          <p className="rounded-[3px] border border-red-500/30 bg-red-500/5 px-2.5 py-2 font-mono text-[12px] text-red-400">
            {parsed.error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => setRawJson(SAMPLE)}
            className="rounded-[4px] border border-border bg-bg-elev px-2.5 py-1 text-[12px] text-fg-muted transition-colors hover:bg-bg-elev-2 hover:text-foreground"
          >
            Load sample
          </button>
          <button
            onClick={copyJson}
            disabled={!rawJson}
            className="inline-flex items-center gap-1 rounded-[4px] border border-border bg-bg-elev px-2.5 py-1 text-[12px] text-fg-muted transition-colors hover:bg-bg-elev-2 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy
              </>
            )}
          </button>
          <button
            onClick={() => setRawJson("")}
            disabled={!rawJson}
            className="ml-auto inline-flex items-center gap-1 rounded-[4px] border border-border bg-bg-elev px-2.5 py-1 text-[12px] text-fg-muted transition-colors hover:bg-bg-elev-2 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        </div>
      </div>

      {/* RIGHT — visual */}
      <div className="space-y-5 lg:max-h-[calc(100vh-4rem)] lg:overflow-auto lg:pr-1">
        {categories.map((cat) => (
          <Category key={cat.name} category={cat} parsed={parsed} />
        ))}
        {parsed?.ok && customKeys.length > 0 && (
          <CustomKeys keys={customKeys} parsed={parsed.value} />
        )}
      </div>
    </div>
  );
}

function Category({
  category,
  parsed,
}: {
  category: SettingCategory;
  parsed: ParseResult | null;
}) {
  const obj = parsed?.ok ? parsed.value : null;
  const setCount = obj
    ? category.settings.filter((s) => s.key in obj).length
    : 0;
  return (
    <div className="rounded-[4px] border border-border bg-bg-elev">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
          {category.name}
        </span>
        {setCount > 0 && (
          <span className="font-mono text-[10.5px] text-emerald-400">
            {setCount} set
          </span>
        )}
      </div>
      <div className="divide-y divide-border">
        {category.settings.map((s) => (
          <SettingRow key={s.key} entry={s} obj={obj} />
        ))}
      </div>
    </div>
  );
}

function SettingRow({
  entry,
  obj,
}: {
  entry: SettingEntry;
  obj: Record<string, unknown> | null;
}) {
  const present = obj !== null && entry.key in obj;
  const value = present ? obj[entry.key] : undefined;
  return (
    <div className="px-4 py-3">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span
          className={cn(
            "font-mono text-[13px]",
            present ? "text-foreground" : "text-fg-muted",
          )}
        >
          {entry.key}
        </span>
        <TypePill type={entry.type} />
        {entry.scope && <ScopePill scope={entry.scope} />}
        {present && (
          <span className="font-mono text-[10.5px] text-emerald-400">set</span>
        )}
        <a
          href={entry.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-0.5 text-[11px] text-fg-dim transition-colors hover:text-foreground"
        >
          docs <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
      <p className="mt-1 text-[12px] text-fg-dim">{entry.description}</p>
      {present && (
        <pre className="mt-2 overflow-x-auto rounded-[3px] bg-bg-elev-2 px-2 py-1.5 font-mono text-[11.5px] text-fg-muted">
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
      {!present && entry.example && (
        <details className="mt-1.5">
          <summary className="cursor-pointer text-[11px] text-fg-dim hover:text-fg-muted">
            example
          </summary>
          <pre className="mt-1 overflow-x-auto rounded-[3px] bg-bg-elev-2 px-2 py-1.5 font-mono text-[11.5px] text-fg-faint">
            {entry.example}
          </pre>
        </details>
      )}
    </div>
  );
}

function CustomKeys({
  keys,
  parsed,
}: {
  keys: string[];
  parsed: Record<string, unknown>;
}) {
  return (
    <div className="rounded-[4px] border border-amber-500/30 bg-bg-elev">
      <div className="border-b border-border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-400">
        Custom keys ({keys.length})
      </div>
      <div className="divide-y divide-border">
        {keys.map((k) => (
          <div key={k} className="px-4 py-3">
            <div className="font-mono text-[13px] text-foreground">{k}</div>
            <p className="mt-1 text-[12px] text-fg-dim">
              Not in the docs snapshot — could be unrecognised, deprecated, or
              added since this catalogue was generated.
            </p>
            <pre className="mt-2 overflow-x-auto rounded-[3px] bg-bg-elev-2 px-2 py-1.5 font-mono text-[11.5px] text-fg-muted">
              {JSON.stringify(parsed[k], null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

function TypePill({ type }: { type: string }) {
  return (
    <span className="rounded-[3px] border border-border bg-bg-elev-2 px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">
      {type}
    </span>
  );
}

function ScopePill({ scope }: { scope: SettingScope }) {
  return (
    <span className="rounded-[3px] border border-amber-500/30 bg-amber-500/5 px-1.5 py-0.5 font-mono text-[10px] text-amber-400">
      {scope === "user-only" ? "user-only" : "managed"}
    </span>
  );
}
