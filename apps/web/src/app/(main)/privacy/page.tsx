import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — RulesHub",
  description: "What data RulesHub collects, why, and how to manage it.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-[720px] px-6 py-16 prose-content">
      <header className="mb-10">
        <p className="mb-2 font-mono text-[12px] uppercase tracking-[0.1em] text-fg-dim">
          Legal
        </p>
        <h1 className="mb-3 text-[40px] font-semibold leading-[1.1] tracking-[-0.025em]">
          Privacy Policy
        </h1>
        <p className="text-[14px] text-fg-muted">Last updated: 9 May 2026</p>
      </header>

      <div className="space-y-6 text-[15px] leading-relaxed text-fg">
        <p>
          RulesHub is an open-source registry for AI coding tool assets. This
          page describes what information we collect, why we collect it, and how
          to manage your data. We collect as little as possible — there&apos;s
          no tracking pixel, no third-party advertising, no behavioural
          profiling.
        </p>

        <h2 className="mt-10 mb-3 text-[22px] font-semibold tracking-[-0.015em]">
          What we collect
        </h2>

        <h3 className="mt-6 mb-2 text-[16px] font-semibold">
          When you sign in with GitHub
        </h3>
        <p>
          We use GitHub OAuth for sign-in. GitHub returns your username, avatar
          URL, public profile bio, and verified email address. We store these in
          our database to identify you across sessions and to display your
          profile to other users.
        </p>

        <h3 className="mt-6 mb-2 text-[16px] font-semibold">
          When you publish a package
        </h3>
        <p>
          The contents of any package you publish — manifest fields, source
          files inside the archive, version metadata, and the publisher identity
          — are stored in our database and storage backend. Published package
          contents are public by default.
        </p>

        <h3 className="mt-6 mb-2 text-[16px] font-semibold">
          When you generate an API key
        </h3>
        <p>
          We store a hash of every issued API key (never the plaintext) plus a
          short prefix to help you identify it in the dashboard. The plaintext
          is shown to you exactly once; we cannot recover it later.
        </p>

        <h3 className="mt-6 mb-2 text-[16px] font-semibold">Server logs</h3>
        <p>
          Our infrastructure records request IP addresses, user agents,
          timestamps, request paths, and response codes for the purposes of rate
          limiting, abuse mitigation, and operational debugging. Logs are
          retained for 30 days by default.
        </p>

        <h2 className="mt-10 mb-3 text-[22px] font-semibold tracking-[-0.015em]">
          Cookies
        </h2>
        <p>We set two cookies, both essential and first-party:</p>
        <ul className="ml-6 list-disc space-y-2">
          <li>
            <code className="font-mono text-[13px]">rh_session</code> — your
            authenticated session, after you sign in with GitHub.
          </li>
          <li>
            <code className="font-mono text-[13px]">rh_bypass</code> — only used
            when the site is in pre-launch mode and you have an early-access
            bypass link.
          </li>
        </ul>
        <p>
          We don&apos;t use third-party cookies, analytics cookies, or tracking
          pixels.
        </p>

        <h2 className="mt-10 mb-3 text-[22px] font-semibold tracking-[-0.015em]">
          How your data is used
        </h2>
        <ul className="ml-6 list-disc space-y-2">
          <li>To run the registry — sign-in, publish, install, search.</li>
          <li>
            To make you findable — your published packages and public profile
            are searchable and visible to anyone.
          </li>
          <li>
            To moderate abuse — repeated failed authentications, spammed
            publishes, and similar are rate-limited or blocked using your IP and
            account state.
          </li>
        </ul>
        <p>
          We don&apos;t sell your data. We don&apos;t share it with advertisers.
          We don&apos;t use it to train models.
        </p>

        <h2 className="mt-10 mb-3 text-[22px] font-semibold tracking-[-0.015em]">
          Where it lives
        </h2>
        <p>
          Database: self-hosted PostgreSQL, managed via Coolify. Object storage
          for package archives: self-hosted MinIO. Sign-in is brokered by GitHub
          OAuth (subject to{" "}
          <a
            href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            GitHub&apos;s privacy statement
          </a>
          ). All hosting is in Europe.
        </p>

        <h2 className="mt-10 mb-3 text-[22px] font-semibold tracking-[-0.015em]">
          Your rights
        </h2>
        <p>You can:</p>
        <ul className="ml-6 list-disc space-y-2">
          <li>
            Request a copy of the data we hold on you, including all packages
            you&apos;ve published.
          </li>
          <li>
            Correct inaccurate data — most profile fields are editable from your
            dashboard.
          </li>
          <li>
            Delete your account. Yanking individual versions is supported via
            the dashboard; full account deletion is available on request.
          </li>
          <li>Revoke any API key you&apos;ve issued, at any time.</li>
        </ul>
        <p>
          For requests not handled by the dashboard, email{" "}
          <a
            href="mailto:hello@ruleshub.dev"
            className="text-primary underline-offset-4 hover:underline"
          >
            hello@ruleshub.dev
          </a>
          . We aim to respond within 7 days.
        </p>

        <h2 className="mt-10 mb-3 text-[22px] font-semibold tracking-[-0.015em]">
          Changes to this policy
        </h2>
        <p>
          When this policy materially changes, we&apos;ll update the &ldquo;Last
          updated&rdquo; date at the top and post a note on the home page or in
          your dashboard inbox. Continued use after a change constitutes
          acceptance.
        </p>

        <h2 className="mt-10 mb-3 text-[22px] font-semibold tracking-[-0.015em]">
          Contact
        </h2>
        <p>
          Questions? Email{" "}
          <a
            href="mailto:hello@ruleshub.dev"
            className="text-primary underline-offset-4 hover:underline"
          >
            hello@ruleshub.dev
          </a>
          .
        </p>
      </div>
    </article>
  );
}
