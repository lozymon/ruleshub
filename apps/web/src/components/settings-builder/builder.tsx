"use client";

// Client-side: paste-and-edit scratchpad. The JSON pane is the canonical
// formatted output; visual edits round-trip through it (typing in either
// side re-serializes the other). No data fetching, no server state.

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import type {
  SettingCategory,
  SettingEntry,
  SettingScope,
} from "@/lib/settings-catalogue";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Enums with ≤ PILL_THRESHOLD options render as an inline segmented
// control so every option is visible at a glance — the same pattern
// macOS / VSCode use for short discrete choices. Longer enums fall
// back to a shadcn Select so the row doesn't wrap awkwardly.
const PILL_THRESHOLD = 4;

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

// ── Type helpers ──────────────────────────────────────────────────────

const ENUM_PREFIX = "enum:";

function isEnum(type: string): boolean {
  return type.startsWith(ENUM_PREFIX);
}
function enumValues(type: string): string[] {
  return type.slice(ENUM_PREFIX.length).split("|");
}

// Validate a value against the catalogue's declared type. Returns an
// error message string if the value doesn't fit, null if it does.
function validate(type: string, value: unknown): string | null {
  if (isEnum(type)) {
    const allowed = enumValues(type);
    if (typeof value !== "string" || !allowed.includes(value)) {
      return `must be one of: ${allowed.join(", ")}`;
    }
    return null;
  }
  // Union types like "string|array" — accept either branch.
  if (type.includes("|")) {
    const branches = type.split("|");
    return branches.some((b) => validate(b, value) === null)
      ? null
      : `must be one of: ${branches.join(", ")}`;
  }
  switch (type) {
    case "boolean":
      return typeof value === "boolean" ? null : `expected boolean`;
    case "string":
      return typeof value === "string" ? null : `expected string`;
    case "number":
      return typeof value === "number" ? null : `expected number`;
    case "array":
      return Array.isArray(value) ? null : `expected array`;
    case "object":
      return value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
        ? null
        : `expected object`;
    default:
      return null;
  }
}

function defaultForType(type: string): unknown {
  if (type === "boolean") return false;
  if (type === "number") return 0;
  if (type === "string") return "";
  if (type === "object") return {};
  if (type === "array") return [];
  if (isEnum(type)) return enumValues(type)[0] ?? "";
  return ""; // unions, unknown types
}

// Try to lift a sensible initial value from the catalogue's example —
// most examples are `{ "<key>": <value> }`, so we parse and pick out
// our key. Falls back to defaultForType.
function initialValue(entry: SettingEntry): unknown {
  if (entry.example) {
    try {
      const parsed: unknown = JSON.parse(entry.example);
      if (
        parsed !== null &&
        typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        entry.key in (parsed as Record<string, unknown>)
      ) {
        return (parsed as Record<string, unknown>)[entry.key];
      }
    } catch {
      // fall through
    }
  }
  return defaultForType(entry.type);
}

// ── State + edit helpers ──────────────────────────────────────────────

// commitEdit always re-serializes the whole settings object so the
// textarea stays in sync with the canonical state. Cosmetic formatting
// the user added in the textarea is lost on visual edits — that's the
// v2 trade-off; v3 may preserve format via a structured AST.
function applyEdit(
  rawJson: string,
  updater: (obj: Record<string, unknown>) => Record<string, unknown>,
): string {
  const parsed = tryParse(rawJson);
  const base = parsed?.ok === true ? parsed.value : {};
  const next = updater(base);
  return JSON.stringify(next, null, 2);
}

// ── Component ─────────────────────────────────────────────────────────

export function SettingsBuilder({
  categories,
}: {
  categories: SettingCategory[];
}) {
  const [rawJson, setRawJson] = useState("");
  const [baseline, setBaseline] = useState<string>(""); // for the "modified" indicator
  const [copied, setCopied] = useState(false);

  // Snapshot the first non-empty textarea content as the baseline so
  // the "modified" pill measures drift from what the user originally
  // pasted. Explicit "Mark as baseline" overrides via the action button.
  useEffect(() => {
    if (!baseline && rawJson.trim()) setBaseline(rawJson);
  }, [rawJson, baseline]);

  const parsed = useMemo(() => tryParse(rawJson), [rawJson]);
  const editable = parsed?.ok !== false; // null (empty) or true (valid)

  const knownKeys = useMemo(() => {
    const set = new Set<string>();
    for (const cat of categories) for (const s of cat.settings) set.add(s.key);
    return set;
  }, [categories]);

  const customKeys = useMemo(() => {
    if (parsed?.ok !== true) return [];
    return Object.keys(parsed.value).filter((k) => !knownKeys.has(k));
  }, [parsed, knownKeys]);

  // Count of catalogued (known) keys present in the parsed object —
  // drives the Settings tab badge. Excludes Custom keys so the badge
  // measures "how many catalogued settings have you touched".
  const cataloguedSetCount = useMemo(() => {
    if (parsed?.ok !== true) return 0;
    return Object.keys(parsed.value).filter((k) => knownKeys.has(k)).length;
  }, [parsed, knownKeys]);

  // Diff against baseline — count of top-level keys that differ.
  const modified = useMemo(() => {
    if (!baseline || parsed?.ok !== true) return 0;
    const base = tryParse(baseline);
    if (base?.ok !== true) return 0;
    const cur = parsed.value;
    const allKeys = new Set([...Object.keys(base.value), ...Object.keys(cur)]);
    let count = 0;
    for (const k of allKeys) {
      if (JSON.stringify(base.value[k]) !== JSON.stringify(cur[k])) count++;
    }
    return count;
  }, [parsed, baseline]);

  function setValue(key: string, value: unknown) {
    setRawJson((cur) => applyEdit(cur, (obj) => ({ ...obj, [key]: value })));
  }
  function unsetValue(key: string) {
    setRawJson((cur) =>
      applyEdit(cur, (obj) => {
        const next = { ...obj };
        delete next[key];
        return next;
      }),
    );
  }

  async function copyJson() {
    if (!rawJson) return;
    await navigator.clipboard.writeText(rawJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function loadSample() {
    setRawJson(SAMPLE);
    setBaseline(SAMPLE);
  }
  function clearAll() {
    setRawJson("");
    setBaseline("");
  }
  function resetBaseline() {
    setBaseline(rawJson);
  }

  return (
    <Tabs defaultValue="settings" className="gap-4">
      {/* Tab bar — settings & JSON triggers on the left, Load sample on the right. */}
      <div className="flex flex-wrap items-center gap-3">
        <TabsList variant="line">
          <TabsTrigger value="settings">
            Settings
            {cataloguedSetCount > 0 && (
              <span className="rounded-[3px] bg-emerald-500/10 px-1 py-0.5 font-mono text-[10px] text-emerald-400">
                {cataloguedSetCount} set
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="json">
            settings.json
            {parsed && (
              <span
                className={cn(
                  "rounded-[3px] px-1 py-0.5 font-mono text-[10px]",
                  parsed.ok
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400",
                )}
              >
                {parsed.ok
                  ? `${Object.keys(parsed.value).length} keys`
                  : "invalid"}
              </span>
            )}
            {modified > 0 && (
              <span className="rounded-[3px] bg-amber-500/10 px-1 py-0.5 font-mono text-[10px] text-amber-400">
                {modified} modified
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        <button
          onClick={loadSample}
          className="ml-auto rounded-[4px] border border-border bg-bg-elev px-2.5 py-1 text-[12px] text-fg-muted transition-colors hover:bg-bg-elev-2 hover:text-foreground"
        >
          Load sample
        </button>
      </div>

      {/* Settings tab — full-width visual catalogue. */}
      <TabsContent value="settings" className="space-y-5">
        {categories.map((cat) => (
          <Category
            key={cat.name}
            category={cat}
            parsed={parsed}
            editable={editable}
            onSet={setValue}
            onUnset={unsetValue}
          />
        ))}
        {parsed?.ok && customKeys.length > 0 && (
          <CustomKeys
            keys={customKeys}
            parsed={parsed.value}
            onUnset={unsetValue}
          />
        )}
      </TabsContent>

      {/* JSON tab — textarea + action toolbar. */}
      <TabsContent value="json" className="space-y-3">
        <textarea
          value={rawJson}
          onChange={(e) => setRawJson(e.target.value)}
          placeholder="Paste your .claude/settings.json here, or click Load sample…"
          spellCheck={false}
          aria-label="settings.json content"
          className="min-h-[520px] w-full resize-y rounded-[4px] border border-border bg-bg-elev p-3 font-mono text-[12.5px] leading-relaxed outline-none transition-colors focus:border-border-hover"
        />
        {parsed?.ok === false && (
          <p className="rounded-[3px] border border-red-500/30 bg-red-500/5 px-2.5 py-2 font-mono text-[12px] text-red-400">
            {parsed.error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
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
          {modified > 0 && (
            <button
              onClick={resetBaseline}
              className="rounded-[4px] border border-amber-500/30 bg-amber-500/5 px-2.5 py-1 text-[12px] text-amber-400 transition-colors hover:bg-amber-500/10"
            >
              Mark as baseline
            </button>
          )}
          <button
            onClick={clearAll}
            disabled={!rawJson}
            className="ml-auto inline-flex items-center gap-1 rounded-[4px] border border-border bg-bg-elev px-2.5 py-1 text-[12px] text-fg-muted transition-colors hover:bg-bg-elev-2 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        </div>
      </TabsContent>
    </Tabs>
  );
}

// ── Category ──────────────────────────────────────────────────────────

function Category({
  category,
  parsed,
  editable,
  onSet,
  onUnset,
}: {
  category: SettingCategory;
  parsed: ParseResult | null;
  editable: boolean;
  onSet: (key: string, value: unknown) => void;
  onUnset: (key: string) => void;
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
          <SettingRow
            key={s.key}
            entry={s}
            obj={obj}
            editable={editable}
            onSet={onSet}
            onUnset={onUnset}
          />
        ))}
      </div>
    </div>
  );
}

// ── Setting row ───────────────────────────────────────────────────────

function SettingRow({
  entry,
  obj,
  editable,
  onSet,
  onUnset,
}: {
  entry: SettingEntry;
  obj: Record<string, unknown> | null;
  editable: boolean;
  onSet: (key: string, value: unknown) => void;
  onUnset: (key: string) => void;
}) {
  const present = obj !== null && entry.key in obj;
  const value = present ? obj[entry.key] : undefined;
  const error = present ? validate(entry.type, value) : null;

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
        {present && !error && (
          <span className="font-mono text-[10.5px] text-emerald-400">set</span>
        )}
        {error && (
          <span className="inline-flex items-center gap-0.5 rounded-[3px] bg-red-500/10 px-1 py-0.5 font-mono text-[10.5px] text-red-400">
            <TriangleAlert className="h-2.5 w-2.5" /> {error}
          </span>
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
      {present ? (
        <ValueEditor
          entry={entry}
          value={value}
          disabled={!editable}
          onChange={(v) => onSet(entry.key, v)}
          onUnset={() => onUnset(entry.key)}
        />
      ) : (
        <UnsetActions
          entry={entry}
          disabled={!editable}
          onSet={() => onSet(entry.key, initialValue(entry))}
        />
      )}
    </div>
  );
}

// ── Editable value renderer ──────────────────────────────────────────

function ValueEditor({
  entry,
  value,
  disabled,
  onChange,
  onUnset,
}: {
  entry: SettingEntry;
  value: unknown;
  disabled: boolean;
  onChange: (v: unknown) => void;
  onUnset: () => void;
}) {
  const inputBase =
    "rounded-[3px] border border-border bg-bg-elev-2 px-2 py-1 font-mono text-[12px] outline-none transition-colors focus:border-border-hover disabled:cursor-not-allowed disabled:opacity-50";

  // boolean → checkbox
  if (entry.type === "boolean" && typeof value === "boolean") {
    return (
      <Row onUnset={onUnset}>
        <label className="inline-flex cursor-pointer items-center gap-2 text-[12px]">
          <input
            type="checkbox"
            checked={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
            className="h-3.5 w-3.5 accent-primary"
          />
          <span className="font-mono text-fg-muted">{String(value)}</span>
        </label>
      </Row>
    );
  }

  // enum → segmented control (small) or shadcn Select (longer)
  if (isEnum(entry.type)) {
    const allowed = enumValues(entry.type);
    const currentString = typeof value === "string" ? value : "";

    if (allowed.length <= PILL_THRESHOLD) {
      return (
        <Row onUnset={onUnset}>
          <div className="inline-flex flex-wrap items-center gap-0.5 rounded-[3px] border border-border bg-bg-elev-2 p-0.5">
            {allowed.map((v) => {
              const active = v === currentString;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => onChange(v)}
                  disabled={disabled}
                  className={cn(
                    "rounded-[2px] px-2 py-0.5 font-mono text-[11.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    active
                      ? "bg-bg-elev text-foreground shadow-[inset_0_0_0_1px_var(--border)]"
                      : "text-fg-muted hover:text-foreground",
                  )}
                  aria-pressed={active}
                >
                  {v}
                </button>
              );
            })}
            {currentString && !allowed.includes(currentString) && (
              <span className="rounded-[2px] bg-red-500/10 px-2 py-0.5 font-mono text-[11.5px] text-red-400">
                {currentString} (invalid)
              </span>
            )}
          </div>
        </Row>
      );
    }

    return (
      <Row onUnset={onUnset}>
        <Select
          value={currentString}
          onValueChange={(v) => onChange(v)}
          disabled={disabled}
        >
          <SelectTrigger size="sm" className="min-w-[180px] font-mono">
            <SelectValue placeholder="Choose a value…" />
          </SelectTrigger>
          <SelectContent>
            {currentString && !allowed.includes(currentString) && (
              <SelectItem
                value={currentString}
                className="font-mono text-red-400"
              >
                {currentString} (invalid)
              </SelectItem>
            )}
            {allowed.map((v) => (
              <SelectItem key={v} value={v} className="font-mono">
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Row>
    );
  }

  // string → text input
  if (entry.type === "string" && typeof value === "string") {
    return (
      <Row onUnset={onUnset}>
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputBase, "flex-1")}
        />
      </Row>
    );
  }

  // number → number input
  if (entry.type === "number" && typeof value === "number") {
    return (
      <Row onUnset={onUnset}>
        <input
          type="number"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isNaN(n)) onChange(n);
          }}
          className={cn(inputBase, "w-32")}
        />
      </Row>
    );
  }

  // Fallback: JSON viewer + unset. Object/array editing via UI is v3
  // scope — for now the JSON pane is the way in.
  return (
    <div className="mt-2 space-y-1.5">
      <pre className="overflow-x-auto rounded-[3px] bg-bg-elev-2 px-2 py-1.5 font-mono text-[11.5px] text-fg-muted">
        {JSON.stringify(value, null, 2)}
      </pre>
      <div className="flex items-center gap-3 text-[11px] text-fg-dim">
        <span>Edit nested values via the JSON pane.</span>
        <button
          onClick={onUnset}
          disabled={disabled}
          className="ml-auto inline-flex items-center gap-1 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-3 w-3" /> unset
        </button>
      </div>
    </div>
  );
}

function Row({
  children,
  onUnset,
}: {
  children: React.ReactNode;
  onUnset: () => void;
}) {
  return (
    <div className="mt-2 flex items-center gap-2">
      {children}
      <button
        onClick={onUnset}
        className="ml-auto inline-flex items-center gap-1 text-[11px] text-fg-dim transition-colors hover:text-foreground"
      >
        <Trash2 className="h-3 w-3" /> unset
      </button>
    </div>
  );
}

// ── Unset row actions ────────────────────────────────────────────────

function UnsetActions({
  entry,
  disabled,
  onSet,
}: {
  entry: SettingEntry;
  disabled: boolean;
  onSet: () => void;
}) {
  return (
    <div className="mt-1.5 space-y-1.5">
      {entry.example && (
        <details>
          <summary className="cursor-pointer text-[11px] text-fg-dim hover:text-fg-muted">
            example
          </summary>
          <pre className="mt-1 overflow-x-auto rounded-[3px] bg-bg-elev-2 px-2 py-1.5 font-mono text-[11.5px] text-fg-faint">
            {entry.example}
          </pre>
        </details>
      )}
      <button
        onClick={onSet}
        disabled={disabled}
        className="inline-flex items-center gap-1 rounded-[3px] border border-border bg-bg-elev-2 px-2 py-1 text-[11px] text-fg-muted transition-colors hover:border-border-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-3 w-3" /> set
      </button>
    </div>
  );
}

// ── Custom keys ──────────────────────────────────────────────────────

function CustomKeys({
  keys,
  parsed,
  onUnset,
}: {
  keys: string[];
  parsed: Record<string, unknown>;
  onUnset: (key: string) => void;
}) {
  return (
    <div className="rounded-[4px] border border-amber-500/30 bg-bg-elev">
      <div className="border-b border-border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-400">
        Custom keys ({keys.length})
      </div>
      <div className="divide-y divide-border">
        {keys.map((k) => (
          <div key={k} className="px-4 py-3">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[13px] text-foreground">{k}</span>
              <button
                onClick={() => onUnset(k)}
                className="ml-auto inline-flex items-center gap-1 text-[11px] text-fg-dim transition-colors hover:text-foreground"
              >
                <Trash2 className="h-3 w-3" /> remove
              </button>
            </div>
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

// ── Pills ────────────────────────────────────────────────────────────

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
