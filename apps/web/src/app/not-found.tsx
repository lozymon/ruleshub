import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="mb-3 font-mono text-[13px] text-fg-dim">404</p>
      <h1 className="mb-3 text-[28px] font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="mb-8 text-[15px] text-fg-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-[14px] font-medium text-primary-foreground hover:opacity-90 transition-opacity"
      >
        Go home
      </Link>
    </div>
  );
}
