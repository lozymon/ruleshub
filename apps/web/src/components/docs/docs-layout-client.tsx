"use client"; // manages mobile drawer open/close state

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { DocsSidebar } from "./docs-sidebar";
import { DocsSearch } from "./docs-search";
import { DocsToc } from "./docs-toc";

export function DocsLayoutClient({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-[1240px]">
      {/* Desktop sidebar */}
      <div className="hidden md:block sticky top-[56px] h-[calc(100vh-56px)] w-[240px] shrink-0 overflow-y-auto border-r border-border">
        <div className="px-4 pt-5 pb-2">
          <DocsSearch />
        </div>
        <DocsSidebar />
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-14 left-0 right-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 backdrop-blur px-4 py-2">
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open docs menu"
          className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] text-fg-muted hover:text-foreground hover:bg-bg-elev transition-colors"
        >
          <Menu className="h-4 w-4" />
          Menu
        </button>
        <div className="flex-1">
          <DocsSearch />
        </div>
      </div>

      {/* Mobile drawer backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer panel */}
      <div
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-72 bg-background border-r border-border overflow-y-auto transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-4">
          <DocsSidebar onClose={() => setIsOpen(false)} />
        </div>
      </div>

      {/* Article */}
      <div className="min-w-0 flex-1 border-r border-border py-8 px-8 mt-12 md:mt-0">
        {children}
      </div>

      {/* Right rail TOC */}
      <DocsToc />
    </div>
  );
}
