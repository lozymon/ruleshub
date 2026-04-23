import type { Metadata } from "next";
import { Package, Zap, Globe, Shield } from "lucide-react";
import { EmailForm } from "./email-form";

export const metadata: Metadata = {
  title: "Coming Soon — RulesHub",
  description:
    "The registry for AI coding tool assets. Rules, commands, workflows, agents, and MCP servers — one place, every tool.",
};

const FEATURES = [
  {
    icon: Package,
    title: "One manifest, every tool",
    description:
      "Publish once and install into Claude Code, Cursor, Copilot, Windsurf, and more with a single command.",
  },
  {
    icon: Zap,
    title: "Instant installs via CLI",
    description:
      "npx ruleshub install <package> drops the right files into your project in seconds.",
  },
  {
    icon: Globe,
    title: "Community-powered registry",
    description:
      "Browse thousands of rules, agents, and MCP servers crafted by developers around the world.",
  },
  {
    icon: Shield,
    title: "Versioned and auditable",
    description:
      "Every release is immutable and signed. Know exactly what you are installing.",
  },
];

export default function ComingSoonPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* ── Hero ── */}
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        <div className="hero-grid" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,var(--rh-accent-tint),transparent_70%)]" />

        <div className="relative mx-auto max-w-[760px]">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--rh-accent-border)] bg-[var(--rh-accent-tint)] px-3 py-1 font-mono text-[12px] text-[var(--rh-accent)]">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--rh-accent)]" />
            Early access — be first in line
          </div>

          <h1 className="mb-5 text-[52px] font-semibold leading-[1.06] tracking-[-0.035em] sm:text-[64px]">
            The registry for{" "}
            <span className="text-primary">AI coding tool</span> assets.
          </h1>

          <p className="mb-9 text-[18px] leading-relaxed text-fg-muted">
            Publish and install rules, commands, workflows, agents, and MCP
            servers for Claude&nbsp;Code, Cursor, Copilot, and more — one
            manifest, every tool.
          </p>

          <div className="flex flex-col items-center gap-4">
            <EmailForm />
            <p className="text-[13px] text-fg-dim">
              No spam. Unsubscribe any time.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-[1240px]">
          <p className="mb-10 text-center font-mono text-[12px] uppercase tracking-[0.1em] text-fg-dim">
            What you&apos;re signing up for
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-bg-elev p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-fg-muted">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="mb-1.5 text-[14px] font-semibold">{title}</h3>
                <p className="text-[13px] leading-relaxed text-fg-muted">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Install preview ── */}
      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-[560px] text-center">
          <p className="mb-5 text-[15px] text-fg-muted">
            When it launches, this is all it takes.
          </p>
          <div className="inline-flex items-center gap-2.5 rounded-lg border border-border bg-bg-elev px-5 py-3 font-mono text-[14px] text-fg-muted">
            <span className="text-fg-faint">$</span>
            <span className="text-foreground">
              npx ruleshub install{" "}
              <span className="text-primary">vercel/nextjs-rules</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
