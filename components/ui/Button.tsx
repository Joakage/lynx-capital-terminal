import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({
  children,
  variant = "secondary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}) {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-1 focus:ring-accent/40";
  const sizes = { sm: "px-2.5 py-1 text-xs", md: "px-3 py-1.5 text-sm" };
  const variants = {
    primary: "bg-accent text-bg hover:bg-accent-hover",
    secondary: "border border-border bg-bg-elevated hover:bg-bg-hover text-fg",
    ghost: "text-fg hover:bg-bg-hover",
    danger: "bg-neg/15 text-neg hover:bg-neg/25 border border-neg/30",
  } as const;
  return (
    <button {...props} className={cn(base, sizes[size], variants[variant], className)}>
      {children}
    </button>
  );
}
