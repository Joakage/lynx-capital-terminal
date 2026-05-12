import { cn, pnlColor } from "@/lib/utils";
import type { ReactNode } from "react";

export function Metric({
  label,
  value,
  sub,
  delta,
  tone,
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  delta?: number;
  tone?: "pos" | "neg" | "neutral";
  className?: string;
}) {
  const valueTone =
    tone === "pos" ? "text-pos" :
    tone === "neg" ? "text-neg" :
    typeof delta === "number" ? pnlColor(delta) : "text-fg";
  return (
    <div className={cn("rounded-lg border border-border bg-bg-panel p-3", className)}>
      <div className="text-2xs uppercase tracking-wide text-fg-muted">{label}</div>
      <div className={cn("mt-1 text-lg font-semibold numeric", valueTone)}>{value}</div>
      {sub && <div className="mt-0.5 text-2xs text-fg-muted numeric">{sub}</div>}
    </div>
  );
}
