"use client";

export default function DiffError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-center px-6 py-32 text-center">
      <p className="mb-1 text-[16px] font-medium">Could not load diff</p>
      <p className="mb-6 text-[13px] text-fg-dim">
        One or both versions may not exist.
      </p>
      <button
        onClick={reset}
        className="inline-flex h-8 items-center rounded-md border border-border-strong px-3 text-[13px] font-medium transition-colors hover:border-border-hover"
      >
        Try again
      </button>
    </div>
  );
}
