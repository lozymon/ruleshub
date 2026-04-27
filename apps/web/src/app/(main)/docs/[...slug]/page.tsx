import { notFound } from "next/navigation";
import { readFileSync } from "fs";
import Link from "next/link";
import { ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { contentMap } from "@/docs/content-map";
import { docNav, flatPages } from "@/docs/nav";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";
import type { Metadata } from "next";

const GITHUB_EDIT_BASE =
  "https://github.com/lozymon/ruleshub/edit/main/apps/web/src/docs";

const mdxComponents = { Callout, pre: CodeBlock };

interface Props {
  params: Promise<{ slug: string[] }>;
}

export function generateStaticParams() {
  return Object.keys(contentMap).map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const key = slug.join("/");
  const page = flatPages().find((p) => p.slug === key);
  return { title: page ? `${page.title} — RulesHub Docs` : "RulesHub Docs" };
}

export default async function DocsPage({ params }: Props) {
  const { slug } = await params;
  const key = slug.join("/");
  const filePath = contentMap[key];

  if (!filePath) notFound();

  const source = readFileSync(filePath, "utf-8");
  const editUrl = `${GITHUB_EDIT_BASE}/${key}.mdx`;

  const pages = flatPages();
  const idx = pages.findIndex((p) => p.slug === key);
  const prev = idx > 0 ? pages[idx - 1] : null;
  const next = idx < pages.length - 1 ? pages[idx + 1] : null;
  const currentPage = pages[idx];

  const section = docNav.find((s) => s.pages.some((p) => p.slug === key));

  return (
    <article id="doc-article" className="prose-docs max-w-3xl">
      {/* Breadcrumb + Edit on GitHub */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 font-mono text-[12px] text-fg-dim">
          <Link
            href="/docs"
            className="text-fg-muted hover:text-foreground transition-colors"
          >
            Docs
          </Link>
          {section && (
            <>
              <ChevronRight className="h-2.5 w-2.5" />
              <span className="text-fg-muted">{section.title}</span>
            </>
          )}
          {currentPage && (
            <>
              <ChevronRight className="h-2.5 w-2.5" />
              <span className="text-foreground">{currentPage.title}</span>
            </>
          )}
        </div>
        <a
          href={editUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[12px] text-fg-muted hover:text-foreground transition-colors"
        >
          <svg
            className="h-3 w-3"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.12-1.47-1.12-1.47-.91-.62.07-.61.07-.61 1.01.07 1.54 1.04 1.54 1.04.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.28.1-2.66 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.41.1 2.66.64.7 1.03 1.59 1.03 2.68 0 3.84-2.35 4.68-4.58 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
          </svg>
          Edit on GitHub
        </a>
      </div>

      {/* MDX content */}
      <MDXRemote
        source={source}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [
                rehypePrettyCode,
                {
                  theme: { dark: "github-dark-dimmed", light: "github-light" },
                  keepBackground: false,
                },
              ],
            ],
          },
        }}
      />

      {/* Prev / Next navigation */}
      <hr className="my-10 border-border" />
      <div className="grid grid-cols-2 gap-3">
        {prev ? (
          <Link
            href={`/docs/${prev.slug}`}
            className="flex flex-col rounded-sm border border-border bg-bg-elev px-4 py-3.5 transition-colors hover:border-border-hover"
          >
            <span className="mb-1 flex items-center gap-1 text-[11px] text-fg-dim">
              <ArrowLeft className="h-3 w-3" />
              Previous
            </span>
            <span className="text-[13.5px] font-medium text-foreground">
              {prev.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/docs/${next.slug}`}
            className="flex flex-col items-end rounded-sm border border-border bg-bg-elev px-4 py-3.5 text-right transition-colors hover:border-border-hover"
          >
            <span className="mb-1 flex items-center gap-1 text-[11px] text-fg-dim">
              Next
              <ArrowRight className="h-3 w-3" />
            </span>
            <span className="text-[13.5px] font-medium text-foreground">
              {next.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </article>
  );
}
