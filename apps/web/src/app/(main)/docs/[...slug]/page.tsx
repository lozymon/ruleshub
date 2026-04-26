import { notFound } from "next/navigation";
import { readFileSync } from "fs";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { contentMap } from "@/docs/content-map";
import { flatPages } from "@/docs/nav";
import type { Metadata } from "next";

const GITHUB_EDIT_BASE =
  "https://github.com/lozymon/ruleshub/edit/main/apps/web/src/docs";

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

  return (
    <article className="prose-docs max-w-3xl">
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              [
                rehypePrettyCode,
                {
                  theme: "github-dark-dimmed",
                  keepBackground: false,
                },
              ],
            ],
          },
        }}
      />
      <div className="mt-12 border-t border-border pt-6">
        <a
          href={editUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Edit this page on GitHub →
        </a>
      </div>
    </article>
  );
}
