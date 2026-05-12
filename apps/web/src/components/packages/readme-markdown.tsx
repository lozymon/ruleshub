import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { parse as parseYaml } from "yaml";
import { routes } from "@/lib/routes";

// Matches a bare `namespace/name` reference (the convention READMEs use to
// link to another RulesHub package). We only rewrite when there is *no*
// leading slash — `/api/health` is an absolute path the author wrote
// deliberately and shouldn't be silently hijacked to `/packages/api/health`.
const PACKAGE_LINK = /^([a-z0-9][a-z0-9_-]*)\/([a-z0-9][a-z0-9_-]*)\/?$/i;

// Explicit allowlist of schemes we'll honour in rendered READMEs. Everything
// else (`javascript:`, `data:`, `vbscript:`, …) is dropped. react-markdown's
// `defaultUrlTransform` already strips dangerous schemes today, but enforcing
// our own allowlist here means the safety holds even if that default changes
// or a future caller overrides it.
const SAFE_SCHEMES = ["http:", "https:", "mailto:"];

// Matches a YAML frontmatter block at the very start of the document
// (used by Claude Code SKILL.md / agent files). Rendering it through the
// markdown pipeline would mis-parse it as a setext heading + paragraph,
// so we extract it and render structured metadata above the body instead.
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

type FrontmatterValue = string | number | boolean | FrontmatterValue[];
type Frontmatter = Record<string, FrontmatterValue>;

interface ExtractedFrontmatter {
  data: Frontmatter | null;
  body: string;
}

function isPlainValue(v: unknown): v is string | number | boolean {
  return (
    typeof v === "string" || typeof v === "number" || typeof v === "boolean"
  );
}

function isPlainArray(v: unknown): v is FrontmatterValue[] {
  return Array.isArray(v) && v.every((item) => isPlainValue(item));
}

function extractFrontmatter(content: string): ExtractedFrontmatter {
  const match = content.match(FRONTMATTER);
  if (!match) return { data: null, body: content };

  let parsed: unknown;
  try {
    parsed = parseYaml(match[1]);
  } catch {
    return { data: null, body: content };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { data: null, body: content };
  }

  const data: Frontmatter = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (isPlainValue(value) || isPlainArray(value)) {
      data[key] = value;
    }
  }

  if (Object.keys(data).length === 0) {
    return { data: null, body: content };
  }

  return { data, body: content.slice(match[0].length) };
}

function FrontmatterBlock({ data }: { data: Frontmatter }) {
  return (
    <dl className="mb-4 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 rounded-md border border-border bg-bg-elev px-4 py-3 text-[13px]">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="contents">
          <dt className="font-mono text-[11px] uppercase tracking-wide text-fg-dim pt-0.5">
            {key}
          </dt>
          <dd className="min-w-0 text-fg-muted">
            <FrontmatterValueView value={value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function FrontmatterValueView({ value }: { value: FrontmatterValue }) {
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((item, i) => (
          <code
            key={i}
            className="rounded-[3px] border border-border bg-bg-elev-2 px-1.5 py-0.5 font-mono text-[11.5px] text-foreground"
          >
            {String(item)}
          </code>
        ))}
      </div>
    );
  }
  if (typeof value === "boolean") {
    return (
      <code className="rounded-[3px] border border-border bg-bg-elev-2 px-1.5 py-0.5 font-mono text-[11.5px] text-foreground">
        {value ? "true" : "false"}
      </code>
    );
  }
  return <span className="break-words">{String(value)}</span>;
}

interface RewrittenHref {
  href: string | undefined;
  external: boolean;
}

function rewriteHref(href: string | undefined): RewrittenHref {
  if (!href) return { href: undefined, external: false };
  if (href.startsWith("#")) return { href, external: false };

  // Plain relative paths (no scheme). Try to rewrite `namespace/name` → /packages/...
  if (!/^[a-z][a-z0-9+.-]*:/i.test(href)) {
    const match = href.match(PACKAGE_LINK);
    if (match) {
      return {
        href: routes.package(
          `${match[1].toLowerCase()}/${match[2].toLowerCase()}`,
        ),
        external: false,
      };
    }
    return { href, external: false };
  }

  // Absolute URL — only allow schemes from SAFE_SCHEMES.
  const scheme = href.slice(0, href.indexOf(":") + 1).toLowerCase();
  if (!SAFE_SCHEMES.includes(scheme)) {
    return { href: undefined, external: false };
  }
  return { href, external: scheme === "http:" || scheme === "https:" };
}

function ReadmeLink({ href, ...rest }: ComponentProps<"a">) {
  const { href: safe, external } = rewriteHref(href);
  if (safe === undefined) {
    // Drop the href entirely so the click does nothing; keeps the text visible.
    return <a {...rest} />;
  }
  return (
    <a
      {...rest}
      href={safe}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    />
  );
}

interface ReadmeMarkdownProps {
  children: string;
}

export function ReadmeMarkdown({ children }: ReadmeMarkdownProps) {
  const { data, body } = extractFrontmatter(children);
  return (
    <>
      {data && <FrontmatterBlock data={data} />}
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ReadmeLink }}>
        {body}
      </ReactMarkdown>
    </>
  );
}
