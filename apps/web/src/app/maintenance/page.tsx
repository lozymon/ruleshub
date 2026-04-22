import type { Metadata } from "next";
import { Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Maintenance — RulesHub",
  description:
    "RulesHub is currently undergoing maintenance. We'll be back shortly.",
};

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-bg-elev text-fg-muted">
        <Wrench className="h-7 w-7" />
      </div>

      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--rh-accent-border)] bg-[var(--rh-accent-tint)] px-2.5 py-1 font-mono text-[12px] text-[var(--rh-accent)]">
        <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--rh-accent)]" />
        Scheduled maintenance
      </div>

      <h1 className="mb-3 text-[36px] font-semibold tracking-[-0.03em]">
        We&apos;ll be right back
      </h1>

      <p className="max-w-[460px] text-[16px] leading-relaxed text-fg-muted">
        RulesHub is currently undergoing maintenance. We&apos;re making
        improvements to the platform and will be back online shortly.
      </p>
    </div>
  );
}
