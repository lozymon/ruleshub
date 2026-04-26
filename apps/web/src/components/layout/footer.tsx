import Link from "next/link";
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.12-1.47-1.12-1.47-.91-.62.07-.61.07-.61 1.01.07 1.54 1.04 1.54 1.04.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.28.1-2.66 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.41.1 2.66.64.7 1.03 1.59 1.03 2.68 0 3.84-2.35 4.68-4.58 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
    </svg>
  );
}
import { routes } from "@/lib/routes";

export function Footer() {
  return (
    <footer className="mt-10 border-t border-border">
      <div className="mx-auto max-w-[1240px] px-6 pt-10 pb-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3 flex items-center gap-2 font-mono text-[15px] font-semibold tracking-tight">
              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[5px] bg-primary text-[13px] font-bold text-primary-foreground">
                R
              </span>
              ruleshub
            </div>
            <p className="mb-4 max-w-xs text-[13px] text-fg-muted">
              The open registry for AI coding tool configuration. Publish once,
              install everywhere.
            </p>
            <a
              href="https://github.com/lozymon/ruleshub"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[28px] items-center gap-1.5 rounded-md border border-border-strong px-2.5 text-[12.5px] font-medium text-foreground transition-colors hover:border-border-hover hover:bg-bg-elev"
            >
              <GithubIcon className="h-3 w-3" />
              GitHub
            </a>
          </div>

          {/* Product */}
          <div>
            <h5 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
              Product
            </h5>
            {[
              { href: routes.browse, label: "Browse" },
              { href: routes.publish, label: "Publish" },
              { href: "/docs/cli/overview", label: "CLI" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block py-1 text-[13px] text-fg-muted hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Resources */}
          <div>
            <h5 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
              Resources
            </h5>
            {[
              { href: "/docs", label: "Documentation" },
              {
                href: "/docs/publishing/your-first-package",
                label: "Publishing guide",
              },
              {
                href: "/docs/publishing/manifest-reference",
                label: "Manifest spec",
              },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block py-1 text-[13px] text-fg-muted hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Community */}
          <div>
            <h5 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
              Community
            </h5>
            {[
              { href: "https://twitter.com/ruleshub", label: "Twitter" },
              {
                href: "https://github.com/lozymon/ruleshub/issues",
                label: "Report issue",
              },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="block py-1 text-[13px] text-fg-muted hover:text-foreground transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-5 font-mono text-[12px] text-fg-dim">
          <span>© 2026 ruleshub.dev</span>
          <span>open source · AGPL-3.0</span>
        </div>
      </div>
    </footer>
  );
}
