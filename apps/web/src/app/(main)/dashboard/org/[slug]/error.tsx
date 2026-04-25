"use client";

// Required for error boundaries in Next.js App Router

export default function OrgDashboardError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-center px-6 py-32 text-center">
      <h2 className="mb-2 text-[18px] font-semibold">Something went wrong</h2>
      <p className="mb-6 text-fg-dim">
        Failed to load the organisation dashboard.
      </p>
      <button
        onClick={reset}
        className="inline-flex h-[34px] items-center rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}
