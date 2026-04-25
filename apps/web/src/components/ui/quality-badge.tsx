interface QualityBadgeProps {
  score: number;
  size?: "sm" | "md";
}

export function QualityBadge({ score, size = "sm" }: QualityBadgeProps) {
  const color =
    score >= 70
      ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
      : score >= 40
        ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
        : "text-red-400 border-red-400/30 bg-red-400/10";

  const sizeClass =
    size === "md" ? "px-2.5 py-1 text-[13px]" : "px-2 py-0.5 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-mono font-medium ${color} ${sizeClass}`}
      title={`Quality score: ${score}/100`}
    >
      <span className="opacity-60">Q</span>
      {score}
    </span>
  );
}
