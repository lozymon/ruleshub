import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — RulesHub",
  description:
    "Terms governing use of the RulesHub registry, dashboard, CLI, and API.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-[720px] px-6 py-16 prose-content">
      <header className="mb-10">
        <p className="mb-2 font-mono text-[12px] uppercase tracking-[0.1em] text-fg-dim">
          Legal
        </p>
        <h1 className="mb-3 text-[40px] font-semibold leading-[1.1] tracking-[-0.025em]">
          Terms of Service
        </h1>
        <p className="text-[14px] text-fg-muted">Last updated: 9 May 2026</p>
      </header>

      <div className="space-y-6 text-[15px] leading-relaxed text-fg">
        <p>
          These terms govern your use of RulesHub — the website at ruleshub.dev,
          the API at api.ruleshub.dev, the CLI distributed via
          npm/PyPI/crates.io/Composer/GitHub, and the dashboard. By creating an
          account, publishing a package, or using the CLI to install from the
          registry, you agree to these terms.
        </p>

        <h2 className="mt-10 mb-3 text-[22px] font-semibold tracking-[-0.015em]">
          Accounts
        </h2>
        <p>
          Sign-in is via GitHub OAuth. You&apos;re responsible for any activity
          on your account. Don&apos;t share credentials, and revoke API keys you
          no longer use. If your GitHub account is compromised, that may extend
          to your RulesHub account — secure both.
        </p>

        <h2 className="mt-10 mb-3 text-[22px] font-semibold tracking-[-0.015em]">
          What you can publish
        </h2>
        <p>
          Packages must be lawful, non-malicious, and fit the platform&apos;s
          purpose (rules, commands, skills, workflows, agents, MCP server
          configs, packs). Specifically, you may not publish:
        </p>
        <ul className="ml-6 list-disc space-y-2">
          <li>
            Malware, credential stealers, exploits targeting users&apos;
            machines.
          </li>
          <li>
            Content that infringes copyright or trademarks you don&apos;t own.
          </li>
          <li>Personal data of others without consent.</li>
          <li>
            Spam, typo-squats of legitimate packages, or content that materially
            misrepresents what it is.
          </li>
          <li>
            Hate speech, harassment, sexual content involving minors, or content
            that&apos;s otherwise unlawful where it&apos;s consumed.
          </li>
        </ul>
        <p>
          We can yank, hide, or remove any package that violates these rules,
          and may suspend or terminate accounts that repeatedly do so.
        </p>

        <h2 className="mt-10 mb-3 text-[22px] font-semibold tracking-[-0.015em]">
          Licensing of published content
        </h2>
        <p>
          You retain ownership of what you publish. By publishing, you grant
          RulesHub a non-exclusive, worldwide, royalty-free license to host,
          mirror, distribute, and display the content as needed to run the
          registry. Each package&apos;s manifest declares an SPDX license — that
          license is what governs end-user installation and reuse. Choose one
          you&apos;re comfortable with; the registry doesn&apos;t override it.
        </p>

        <h2 className="mt-10 mb-3 text-[22px] font-semibold tracking-[-0.015em]">
          Versioning and yanking
        </h2>
        <p>
          Published versions are immutable — once a version is published, its
          contents and version number can&apos;t be edited. You can{" "}
          <em>yank</em> a version (mark it deprecated and hide it from default
          resolution); the bytes stay accessible to anyone who explicitly pinned
          to it, to preserve reproducibility for downstream projects. You can
          delete an entire package via the dashboard if no other published
          package depends on it.
        </p>

        <h2 className="mt-10 mb-3 text-[22px] font-semibold tracking-[-0.015em]">
          Acceptable use of the API and CLI
        </h2>
        <p>
          The CLI and API are free to use within reasonable limits. We
          rate-limit publishes, search, and download endpoints to protect the
          service. If you need more, email{" "}
          <a
            href="mailto:hello@ruleshub.dev"
            className="text-primary underline-offset-4 hover:underline"
          >
            hello@ruleshub.dev
          </a>{" "}
          first — automated abuse is grounds for revoking your tokens.
          Don&apos;t run scrapers; the search and download endpoints are for
          human use and tooling that respects published rate limits.
        </p>

        <h2 className="mt-10 mb-3 text-[22px] font-semibold tracking-[-0.015em]">
          Reporting abuse
        </h2>
        <p>
          To report a package that violates these terms — including DMCA
          takedown requests, security incidents, or content that violates the
          rules above — email{" "}
          <a
            href="mailto:abuse@ruleshub.dev"
            className="text-primary underline-offset-4 hover:underline"
          >
            abuse@ruleshub.dev
          </a>
          . Include the package name and version, the issue, and (if applicable)
          proof of ownership. We aim to triage within 48 hours.
        </p>

        <h2 className="mt-10 mb-3 text-[22px] font-semibold tracking-[-0.015em]">
          No warranty
        </h2>
        <p>
          RulesHub is provided <strong>as-is</strong>, without warranty of any
          kind, express or implied. Packages on the registry are
          contributor-maintained — we do not vet them for security, correctness,
          or fitness for purpose. Verify what you install, the same way you
          would a package from npm, PyPI, or any other open registry.
        </p>

        <h2 className="mt-10 mb-3 text-[22px] font-semibold tracking-[-0.015em]">
          Limitation of liability
        </h2>
        <p>
          To the fullest extent permitted by law, RulesHub and its operators
          aren&apos;t liable for indirect, incidental, special, consequential,
          or punitive damages arising from your use of the service. Our
          aggregate liability for any direct claim is limited to whatever you
          paid us in the past 12 months — which, for a free service, is zero.
        </p>

        <h2 className="mt-10 mb-3 text-[22px] font-semibold tracking-[-0.015em]">
          Termination
        </h2>
        <p>
          You may delete your account at any time from your dashboard. We may
          suspend or terminate accounts that repeatedly violate these terms,
          submit fraudulent abuse reports, or threaten the service&apos;s
          stability. We&apos;ll give notice where reasonable.
        </p>

        <h2 className="mt-10 mb-3 text-[22px] font-semibold tracking-[-0.015em]">
          Changes
        </h2>
        <p>
          When these terms materially change we&apos;ll update the &ldquo;Last
          updated&rdquo; date and post a notice on the home page or in your
          dashboard inbox. Continued use after a change constitutes acceptance.
          For breaking changes (e.g. licensing or moderation policy shifts)
          we&apos;ll give at least 14 days&apos; notice.
        </p>

        <h2 className="mt-10 mb-3 text-[22px] font-semibold tracking-[-0.015em]">
          Contact
        </h2>
        <p>
          General:{" "}
          <a
            href="mailto:hello@ruleshub.dev"
            className="text-primary underline-offset-4 hover:underline"
          >
            hello@ruleshub.dev
          </a>{" "}
          — Abuse:{" "}
          <a
            href="mailto:abuse@ruleshub.dev"
            className="text-primary underline-offset-4 hover:underline"
          >
            abuse@ruleshub.dev
          </a>
          .
        </p>
      </div>
    </article>
  );
}
