import { notFound } from "next/navigation";
import { readFileSync } from "fs";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { contentMap } from "@/docs/content-map";
import { flatPages } from "@/docs/nav";
import type { Metadata } from "next";

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

  return (
    <article className="prose-docs max-w-3xl">
      <MDXRemote
        source={source}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </article>
  );
}
