import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ReadmeLink }}>
      {children}
    </ReactMarkdown>
  );
}
