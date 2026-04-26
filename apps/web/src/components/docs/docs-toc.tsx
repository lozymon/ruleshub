"use client"; // reads DOM headings + IntersectionObserver scroll-spy

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function DocsToc() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const article = document.getElementById("doc-article");
    if (!article) return;

    const nodes = Array.from(
      article.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]"),
    );
    setHeadings(
      nodes.map((el) => ({
        id: el.id,
        text: el.textContent ?? "",
        level: Number(el.tagName[1]),
      })),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );
    nodes.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <aside className="hidden xl:block w-[220px] shrink-0 sticky top-[56px] h-[calc(100vh-56px)] overflow-y-auto py-8 pl-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim mb-3">
        On this page
      </div>
      <nav className="space-y-0.5">
        {headings.map((h) => {
          const active = h.id === activeId;
          return (
            <a
              key={h.id}
              href={`#${h.id}`}
              style={{ paddingLeft: h.level === 3 ? "20px" : "12px" }}
              className={`block border-l-2 py-1 text-[12.5px] transition-colors ${
                active
                  ? "border-primary font-medium text-primary"
                  : "border-border text-fg-muted hover:text-foreground"
              }`}
            >
              {h.text}
            </a>
          );
        })}
      </nav>
      <div className="mt-6 border-t border-border pt-4 space-y-1">
        <a
          href="#"
          className="flex items-center gap-1.5 text-[12px] text-fg-muted py-1 hover:text-foreground transition-colors"
        >
          Was this helpful?
        </a>
        <a
          href="#"
          className="flex items-center gap-1.5 text-[12px] text-fg-muted py-1 hover:text-foreground transition-colors"
        >
          Report an issue
        </a>
      </div>
    </aside>
  );
}
