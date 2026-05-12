import { cn } from "@/lib/utils";
import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="border-b border-border bg-bg-elevated/60">{children}</thead>;
}

export function TBody({ children, className }: { children: ReactNode; className?: string }) {
  return <tbody className={cn("divide-y divide-border-subtle", className)}>{children}</tbody>;
}

export function TR({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn("hover:bg-bg-hover/40 transition-colors", className)}>{children}</tr>;
}

export function TH({
  children, className, align = "left", ...props
}: ThHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "right" | "center" }) {
  const alignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <th
      {...props}
      className={cn(
        "px-3 py-2 text-2xs font-medium uppercase tracking-wide text-fg-muted whitespace-nowrap",
        alignClass,
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TD({
  children, className, align = "left", numeric = false, ...props
}: TdHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "right" | "center"; numeric?: boolean }) {
  const alignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <td
      {...props}
      className={cn(
        "px-3 py-2 whitespace-nowrap",
        alignClass,
        numeric && "numeric",
        className,
      )}
    >
      {children}
    </td>
  );
}
