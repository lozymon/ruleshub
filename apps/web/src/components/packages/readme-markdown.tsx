import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { routes } from "@/lib/routes";

// Matches `namespace/name` or `/namespace/name` — exactly two simple segments,
// so things like `docs/intro.md` or `foo/bar/baz` are left alone.
const PACKAGE_LINK = /^\/?([a-z0-9][a-z0-9_-]*)\/([a-z0-9][a-z0-9_-]*)\/?$/i;

function rewriteHref(href: string | undefined): string | undefined {
  if (!href) return href;
  if (href.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(href)) return href;
  const match = href.match(PACKAGE_LINK);
  if (match) return routes.package(`${match[1]}/${match[2]}`);
  return href;
}

function ReadmeLink({ href, ...rest }: ComponentProps<"a">) {
  return <a {...rest} href={rewriteHref(href)} />;
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
