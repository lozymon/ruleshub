"use client"; // tab switching state

import { useState } from "react";
import { Package, Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PackageDto } from "@ruleshub/types";
import { PackageCard } from "@/components/packages/package-card";

const TABS = [
  { id: "packages", label: "Packages", Icon: Package },
  { id: "starred", label: "Starred", Icon: Star },
  { id: "activity", label: "Activity", Icon: Clock },
] as const;

type Tab = (typeof TABS)[number]["id"];

interface ProfileTabsProps {
  packages: PackageDto[];
  packageCount: number;
}

export function ProfileTabs({ packages, packageCount }: ProfileTabsProps) {
  const [active, setActive] = useState<Tab>("packages");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={cn(
              "inline-flex items-center gap-1.5 border-b-2 px-4 py-3 text-[13px] font-medium transition-colors",
              active === id
                ? "border-primary text-foreground"
                : "border-transparent text-fg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            {id === "packages" && (
              <span className="rounded-[10px] bg-bg-elev-2 px-1.5 py-0.5 font-mono text-[11px] text-fg-dim">
                {packageCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="py-8">
        {active === "packages" && (
          <>
            {packages.length === 0 ? (
              <div className="rounded-sm border border-dashed border-border py-16 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-sm border border-border bg-bg-elev">
                  <Package className="h-5 w-5 text-fg-dim" />
                </div>
                <h3 className="mb-1.5 text-[16px] font-medium">
                  No packages yet
                </h3>
                <p className="text-fg-dim">
                  This publisher hasn&apos;t released anything yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {packages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            )}
          </>
        )}

        {active === "starred" && (
          <div className="rounded-sm border border-dashed border-border py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-sm border border-border bg-bg-elev">
              <Star className="h-5 w-5 text-fg-dim" />
            </div>
            <h3 className="mb-1.5 text-[16px] font-medium">
              No starred packages
            </h3>
            <p className="text-fg-dim">Starred packages will appear here.</p>
          </div>
        )}

        {active === "activity" && (
          <div className="rounded-sm border border-dashed border-border py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-sm border border-border bg-bg-elev">
              <Clock className="h-5 w-5 text-fg-dim" />
            </div>
            <h3 className="mb-1.5 text-[16px] font-medium">No activity yet</h3>
            <p className="text-fg-dim">
              Published packages and stars will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
