import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Badge({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "pos" | "neg" | "warn" | "info" | "muted" | "accent";
}) {
  const toneClasses: Record<string, string> = {
    default: "bg-bg-hover text-fg border-border",
    pos: "bg-pos/15 text-pos border-pos/30",
    neg: "bg-neg/15 text-neg border-neg/30",
    warn: "bg-warn/15 text-warn border-warn/30",
    info: "bg-info/15 text-info border-info/30",
    muted: "bg-bg-hover text-fg-muted border-border",
    accent: "bg-accent/15 text-accent border-accent/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-2xs font-medium uppercase tracking-wide",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
