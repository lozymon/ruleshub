import { BookOpen, Check, AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

const CONFIG = {
  note: {
    icon: BookOpen,
    label: "Note",
    border: "var(--rh-accent)",
    bg: "var(--rh-accent-tint)",
    color: "var(--rh-accent)",
  },
  tip: {
    icon: Check,
    label: "Tip",
    border: "#10b981",
    bg: "rgba(16,185,129,0.10)",
    color: "#10b981",
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    border: "#f59e0b",
    bg: "rgba(245,158,11,0.10)",
    color: "#f59e0b",
  },
} as const;

interface CalloutProps {
  kind?: keyof typeof CONFIG;
  title?: string;
  children: ReactNode;
}

export function Callout({ kind = "note", title, children }: CalloutProps) {
  const { icon: Icon, label, border, bg, color } = CONFIG[kind];
  return (
    <div
      className="my-5 rounded-r-sm text-[13.5px]"
      style={{
        borderLeft: `3px solid ${border}`,
        background: bg,
        padding: "12px 16px",
      }}
    >
      <div
        className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em]"
        style={{ color }}
      >
        <Icon className="h-3.5 w-3.5" />
        {title ?? label}
      </div>
      <div className="leading-relaxed text-foreground">{children}</div>
    </div>
  );
}
