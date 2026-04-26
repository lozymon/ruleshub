"use client"; // needed for usePathname to highlight active link

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { docNav } from "@/docs/nav";
import { contentMap } from "@/docs/content-map";
import { cn } from "@/lib/utils";

interface DocsSidebarProps {
  onClose?: () => void;
}

export function DocsSidebar({ onClose }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 py-8 pr-6">
      {onClose && (
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold">Docs</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {docNav.map((section) => (
        <div key={section.title} className="mb-6">
          <p className="mb-1 px-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {section.pages.map((page) => {
              const href = `/docs/${page.slug}`;
              const active = pathname === href;
              const available = page.slug in contentMap;
              return (
                <li key={page.slug}>
                  {available ? (
                    <Link
                      href={href}
                      onClick={onClose}
                      className={cn(
                        "block rounded-md px-2 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                      )}
                    >
                      {page.title}
                    </Link>
                  ) : (
                    <span className="block px-2 py-1.5 text-sm text-muted-foreground/40 cursor-default select-none">
                      {page.title}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
