"use client"; // needs router for page navigation

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface BrowsePaginationProps {
  page: number;
  totalPages: number;
}

export function BrowsePagination({ page, totalPages }: BrowsePaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(n: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(n));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => goTo(n)}
          className={cn(
            "flex h-8 min-w-8 items-center justify-center rounded-sm border px-2 font-mono text-[13px] transition-colors",
            n === page
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-fg-muted hover:border-border-hover hover:text-foreground",
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
