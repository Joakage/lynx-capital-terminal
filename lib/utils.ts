import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtPct(v: number, digits = 2) {
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(digits)}%`;
}

export function fmtNumber(v: number, digits = 2) {
  return v.toLocaleString("es-ES", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function fmtMoney(v: number, currency: string = "USD", digits = 0) {
  return v.toLocaleString("es-ES", { style: "currency", currency, minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function pnlColor(v: number) {
  if (v > 0) return "text-pos";
  if (v < 0) return "text-neg";
  return "text-fg-muted";
}

export function severityColor(s: "Alta" | "Media" | "Baja") {
  if (s === "Alta") return "bg-neg/15 text-neg border-neg/30";
  if (s === "Media") return "bg-warn/15 text-warn border-warn/30";
  return "bg-info/15 text-info border-info/30";
}

export function sentimentColor(s: "Positivo" | "Neutro" | "Negativo") {
  if (s === "Positivo") return "bg-pos/15 text-pos border-pos/30";
  if (s === "Negativo") return "bg-neg/15 text-neg border-neg/30";
  return "bg-fg-muted/15 text-fg-muted border-fg-muted/30";
}

export function statusColor(s: "Activa" | "En revisión" | "Rota") {
  if (s === "Activa") return "bg-pos/15 text-pos border-pos/30";
  if (s === "En revisión") return "bg-warn/15 text-warn border-warn/30";
  return "bg-neg/15 text-neg border-neg/30";
}

export const CHART_COLORS = ["#f5a623", "#3b82f6", "#22c55e", "#a855f7", "#ec4899", "#14b8a6", "#eab308", "#ef4444", "#6366f1", "#0ea5e9"];
