import type { Metadata } from "next";
import { SettingsBuilder } from "@/components/settings-builder/builder";
import { SETTINGS_CATEGORIES } from "@/lib/settings-catalogue";

export const metadata: Metadata = {
  title: "Claude Code Settings Builder · RulesHub",
  description:
    "Paste a Claude Code .claude/settings.json and see every key it supports, with descriptions and links to the docs.",
};

export default function SettingsBuilderPage() {
  const totalKeys = SETTINGS_CATEGORIES.reduce(
    (sum, c) => sum + c.settings.length,
    0,
  );

  return (
    <div className="mx-auto max-w-[1240px] px-6 pt-7 pb-12">
      <div className="pb-5">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
          Claude Code Settings Builder
        </h1>
        <p className="mt-1.5 max-w-[760px] text-fg-dim">
          Paste your{" "}
          <code className="font-mono text-[13px]">.claude/settings.json</code>{" "}
          on the left to see every key it supports — what each one does, its
          type, and a link to the canonical docs. Snapshot of{" "}
          <span className="font-mono">{totalKeys}</span> settings across{" "}
          <span className="font-mono">{SETTINGS_CATEGORIES.length}</span>{" "}
          categories.
        </p>
      </div>
      <SettingsBuilder categories={SETTINGS_CATEGORIES} />
    </div>
  );
}
