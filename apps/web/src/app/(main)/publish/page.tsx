"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ArrowRight, Upload, X, AlertCircle } from "lucide-react";
import { routes } from "@/lib/routes";
import { TOOL_LABELS } from "@ruleshub/types";
import type { SupportedTool } from "@ruleshub/types";
import { TOOL_COLORS } from "@/lib/tool-colors";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { publishPackage } from "@/lib/api/packages";
import { getMyOrgs } from "@/lib/api/orgs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ASSET_TYPES = [
  { id: "rule", label: "Rule" },
  { id: "command", label: "Command" },
  { id: "workflow", label: "Workflow" },
  { id: "agent", label: "Agent" },
  { id: "mcp-server", label: "MCP Server" },
  { id: "pack", label: "Pack" },
  { id: "skill", label: "Skill" },
] as const;

const TOOLS = Object.entries(TOOL_LABELS) as [SupportedTool, string][];

const DEFAULT_TOOL_PATHS: Record<SupportedTool, string> = {
  "claude-code": "CLAUDE.md",
  cursor: ".cursor/rules/",
  copilot: ".github/copilot-instructions.md",
  windsurf: ".windsurf/rules/",
  cline: ".clinerules",
  aider: ".aiderrules",
  continue: ".continue/rules/",
};

interface FormState {
  namespace: string;
  name: string;
  version: string;
  description: string;
  license: string;
  tags: string;
  projectTypes: string;
  type: string;
  tools: Set<SupportedTool>;
  file: File | null;
  dragging: boolean;
}

function validate(form: FormState) {
  return [
    {
      key: "ns",
      ok: form.namespace.length > 0,
      msg: `namespace: ${form.namespace || "—"} set`,
    },
    {
      key: "name",
      ok: /^[a-z][a-z0-9-]*$/.test(form.name),
      msg: `name: ${form.name || "—"} follows naming convention`,
    },
    {
      key: "version",
      ok: /^\d+\.\d+\.\d+$/.test(form.version),
      msg: `version: ${form.version} is valid semver`,
    },
    {
      key: "desc",
      ok: form.description.length >= 1,
      msg: `description: ${form.description.length} chars`,
    },
    {
      key: "license",
      ok: form.license.length > 0,
      msg: `license: ${form.license || "—"} set`,
    },
    {
      key: "tools",
      ok: form.tools.size > 0,
      msg: `tools: ${form.tools.size} targets selected`,
    },
    {
      key: "file",
      ok: form.file !== null,
      msg: form.file
        ? `source: ${form.file.name} (${(form.file.size / 1024).toFixed(1)} KB)`
        : "source: no file uploaded",
    },
  ];
}

export default function PublishPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [namespaceOptions, setNamespaceOptions] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>({
    namespace: "",
    name: "",
    version: "0.1.0",
    description: "",
    license: "MIT",
    tags: "",
    projectTypes: "",
    type: "rule",
    tools: new Set(["claude-code"] as SupportedTool[]),
    file: null,
    dragging: false,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.username) return;
    const username = user.username;
    setForm((f) => (f.namespace ? f : { ...f, namespace: username }));
    getMyOrgs()
      .then((orgs) => {
        setNamespaceOptions([username, ...orgs.map((o) => o.slug)]);
      })
      .catch(() => {
        setNamespaceOptions([username]);
      });
  }, [user?.username]);

  function update(patch: Partial<Omit<FormState, "tools">>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function toggleTool(tool: SupportedTool) {
    setForm((f) => {
      const tools = new Set(f.tools);
      tools.has(tool) ? tools.delete(tool) : tools.add(tool);
      return { ...f, tools };
    });
  }

  const checks = validate(form);
  const step1Valid = checks.slice(0, 6).every((c) => c.ok);
  const step2Valid = form.file !== null;
  const allValid = checks.every((c) => c.ok);

  async function handlePublish() {
    if (!allValid || !form.file || !user) return;
    setPublishing(true);
    setError(null);
    try {
      const manifest = {
        name: `${form.namespace}/${form.name}`,
        version: form.version,
        type: form.type,
        description: form.description,
        license: form.license,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        projectTypes: form.projectTypes
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        targets: Object.fromEntries(
          [...form.tools].map((tool) => [
            tool,
            { file: DEFAULT_TOOL_PATHS[tool] },
          ]),
        ),
      };

      await publishPackage(form.file, manifest);
      router.push(routes.package(`${form.namespace}/${form.name}`));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Publish failed. Please try again.",
      );
      setPublishing(false);
    }
  }

  const STEPS = [
    { n: 1, label: "Manifest" },
    { n: 2, label: "Upload" },
    { n: 3, label: "Preview" },
  ];

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10 pb-20">
      <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
        Publish a package
      </h1>
      <p className="mt-1 mb-7 text-fg-dim">
        Share rules, commands, workflows, agents, or MCP configs with the
        community.
      </p>

      {/* Stepper */}
      <div className="mb-8 flex border-b border-border">
        {STEPS.map(({ n, label }) => {
          const done = step > n;
          const active = step === n;
          return (
            <button
              key={n}
              onClick={() => n < step && setStep(n)}
              className={cn(
                "flex flex-1 items-center gap-2.5 border-b-2 py-3.5 text-[13px] transition-colors",
                active
                  ? "border-primary text-foreground"
                  : done
                    ? "border-transparent text-fg-muted cursor-pointer hover:text-foreground"
                    : "border-transparent text-fg-dim cursor-default",
              )}
            >
              <span
                className={cn(
                  "flex h-[22px] w-[22px] items-center justify-center rounded-full border font-mono text-[11px] font-semibold",
                  active
                    ? "border-primary bg-[var(--rh-accent-tint)] text-primary"
                    : done
                      ? "border-primary bg-primary text-white"
                      : "border-border-strong text-fg-muted",
                )}
              >
                {done ? <Check className="h-3 w-3" strokeWidth={3} /> : n}
              </span>
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Step 1: Manifest ─────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Namespace" hint="Your username or verified org">
              <Select
                value={form.namespace}
                onValueChange={(v) => v && update({ namespace: v })}
              >
                <SelectTrigger className="w-full font-mono">
                  <SelectValue placeholder="Select namespace" />
                </SelectTrigger>
                <SelectContent>
                  {namespaceOptions.map((ns) => (
                    <SelectItem key={ns} value={ns} className="font-mono">
                      {ns}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Package name" hint="Lowercase, hyphen-separated">
              <Input
                className="font-mono"
                value={form.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="my-awesome-rules"
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Version" hint="Semver (e.g. 1.0.0)">
              <Input
                className="font-mono"
                value={form.version}
                onChange={(e) => update({ version: e.target.value })}
              />
            </Field>
            <Field label="Asset type" hint="What kind of asset is this?">
              <Select
                value={form.type}
                onValueChange={(v) => v && update({ type: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map(({ id, label }) => (
                    <SelectItem key={id} value={id}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="License" hint="SPDX identifier">
              <Input
                className="font-mono"
                value={form.license}
                onChange={(e) => update({ license: e.target.value })}
                placeholder="MIT"
              />
            </Field>
          </div>

          <Field
            label="Description"
            hint="One or two sentences explaining what it does."
          >
            <textarea
              className="min-h-[90px] w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Strict conventions for…"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Tags"
              hint="Comma-separated (e.g. nestjs, typescript)"
            >
              <Input
                value={form.tags}
                onChange={(e) => update({ tags: e.target.value })}
                placeholder="nestjs, typescript"
              />
            </Field>
            <Field
              label="Project types"
              hint="Comma-separated (e.g. nestjs, node)"
            >
              <Input
                value={form.projectTypes}
                onChange={(e) => update({ projectTypes: e.target.value })}
                placeholder="nestjs, node"
              />
            </Field>
          </div>

          <Field
            label="Tool targets"
            hint="Which tools should this package install for?"
          >
            <div className="space-y-2">
              {TOOLS.map(([tool, label]) => {
                const checked = form.tools.has(tool);
                return (
                  <div
                    key={tool}
                    onClick={() => toggleTool(tool)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 transition-colors",
                      checked
                        ? "border-[var(--rh-accent-border)] bg-[var(--rh-accent-tint)]"
                        : "border-border bg-bg-elev hover:border-border-hover",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border",
                        checked
                          ? "border-primary bg-primary"
                          : "border-border-strong",
                      )}
                    >
                      {checked && (
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      )}
                    </div>
                    <div className="flex min-w-[140px] items-center gap-1.5 text-[13.5px] font-medium">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: TOOL_COLORS[tool] }}
                      />
                      {label}
                    </div>
                    <div className="flex-1 rounded-[4px] bg-bg-elev-2 px-2 py-1 font-mono text-[12.5px] text-fg-dim">
                      {DEFAULT_TOOL_PATHS[tool]}
                    </div>
                  </div>
                );
              })}
            </div>
          </Field>

          <div className="flex justify-between pt-2">
            <Link
              href={routes.dashboard}
              className="inline-flex h-[34px] items-center px-3 text-[13px] text-fg-muted transition-colors hover:text-foreground"
            >
              Cancel
            </Link>
            <button
              onClick={() => setStep(2)}
              disabled={!step1Valid}
              className="inline-flex h-[34px] items-center gap-1.5 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-opacity disabled:opacity-50"
            >
              Continue to upload <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Upload ───────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-6">
          <input
            ref={fileRef}
            type="file"
            accept=".zip"
            className="sr-only"
            onChange={(e) => update({ file: e.target.files?.[0] ?? null })}
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              update({ dragging: true });
            }}
            onDragLeave={() => update({ dragging: false })}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f?.name.endsWith(".zip"))
                update({ file: f, dragging: false });
            }}
            className={cn(
              "rounded-[10px] border-2 border-dashed bg-bg-elev py-12 text-center transition-colors",
              form.dragging
                ? "border-primary bg-[var(--rh-accent-tint)]"
                : "border-border-strong",
            )}
          >
            {form.file ? (
              <>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--rh-accent-tint)] text-primary">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="mb-1 text-[15px] font-medium">
                  {form.file.name}
                </h3>
                <p className="mb-4 text-[13px] text-fg-dim">
                  {(form.file.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={() => update({ file: null })}
                  className="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-border-strong px-3 text-[13px] font-medium text-foreground transition-colors hover:border-border-hover"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove
                </button>
              </>
            ) : (
              <>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-bg-elev-2 text-fg-muted">
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="mb-1 text-[15px] font-medium">
                  Drag and drop your .zip file
                </h3>
                <p className="mb-5 text-[13px] text-fg-dim">
                  or browse — up to 5 MB, .zip only
                </p>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex h-[34px] items-center gap-1.5 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground"
                >
                  Select file
                </button>
              </>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="inline-flex h-[34px] items-center px-3 text-[13px] text-fg-muted transition-colors hover:text-foreground"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!step2Valid}
              className="inline-flex h-[34px] items-center gap-1.5 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground disabled:opacity-50"
            >
              Preview <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Preview ──────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-[14px] font-semibold">
              Manifest validation
            </h3>
            <div className="rounded-lg border border-border bg-bg-elev p-4">
              <ul className="space-y-0 font-mono text-[12.5px]">
                {checks.map(({ key, ok, msg }) => (
                  <li
                    key={key}
                    className="flex items-center gap-2 border-b border-border py-1.5 text-fg-muted last:border-0"
                  >
                    <span className={ok ? "text-success" : "text-destructive"}>
                      {ok ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </span>
                    <span className={ok ? "" : "text-destructive"}>{msg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-[14px] font-semibold">
              Dry-run: files to write
            </h3>
            <div className="overflow-hidden rounded-lg border border-border bg-bg-code font-mono text-[12.5px]">
              <div className="flex items-center gap-2 border-b border-border px-3.5 py-2.5 text-fg-muted">
                <span className="text-fg-dim">$</span>
                <span>
                  ruleshub publish --dry-run {form.namespace}/{form.name}@
                  {form.version}
                </span>
              </div>
              <div className="space-y-1 p-4">
                {[...form.tools].map((tool) => (
                  <div key={tool} className="flex items-center gap-3">
                    <span className="font-bold text-success">+</span>
                    <span
                      className="min-w-[90px]"
                      style={{ color: TOOL_COLORS[tool] }}
                    >
                      [{tool}]
                    </span>
                    <span className="text-foreground">
                      {DEFAULT_TOOL_PATHS[tool]}
                    </span>
                  </div>
                ))}
                <div className="mt-3 border-t border-border pt-3 text-fg-muted">
                  <div>
                    ✓ Would publish {form.namespace}/{form.name}@{form.version}
                  </div>
                  <div>
                    ✓ {form.tools.size} tools targeted · {form.tools.size} files
                    to write
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              disabled={publishing}
              className="inline-flex h-[34px] items-center px-3 text-[13px] text-fg-muted transition-colors hover:text-foreground disabled:opacity-50"
            >
              ← Back
            </button>
            <button
              onClick={handlePublish}
              disabled={!allValid || publishing}
              className="inline-flex h-[34px] items-center gap-1.5 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground disabled:opacity-50"
            >
              {publishing ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Publishing…
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Publish package
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && <div className="mt-1.5 text-[12px] text-fg-dim">{hint}</div>}
    </div>
  );
}
