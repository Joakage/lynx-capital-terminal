"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface EarningsItem {
  ticker: string;
  status: "upserted" | "error";
  date?: string;
  period?: string;
  error?: string;
}

interface RefreshEarningsResponse {
  ok: boolean;
  provider: string;
  durationMs: number;
  asOf: string;
  upserted: number;
  errors: number;
  items: EarningsItem[];
  message?: string;
}

export function RefreshEarningsButton({
  label = "Refresh earnings",
  variant = "secondary",
  size = "sm",
}: {
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"loading" | "done" | "error">("loading");
  const [result, setResult] = useState<RefreshEarningsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && state !== "loading") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, state]);

  const handleClick = async () => {
    setOpen(true);
    setState("loading");
    setResult(null);
    setError(null);
    try {
      const resp = await fetch("/api/refresh/earnings", { method: "POST" });
      const data = (await resp.json()) as RefreshEarningsResponse;
      if (!resp.ok || !data.ok) {
        setError(data.message ?? `HTTP ${resp.status}`);
        setResult(data);
        setState("error");
        return;
      }
      setResult(data);
      setState("done");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de red");
      setState("error");
    }
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={handleClick}>{label}</Button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => state !== "loading" && setOpen(false)}
        >
          <div
            className="bg-bg-panel border border-border rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-5 py-3 shrink-0">
              <div>
                <h3 className="text-sm font-semibold tracking-tight">Refresh de calendario earnings</h3>
                {result && (
                  <div className="mt-1 text-2xs text-fg-muted numeric">
                    {result.provider} · {(result.durationMs / 1000).toFixed(1)}s · {result.upserted} upserted
                  </div>
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)} disabled={state === "loading"}>✕</Button>
            </div>
            <div className={cn("flex-1 overflow-y-auto px-5 py-4", state === "loading" && "flex items-center justify-center")}>
              {state === "loading" && (
                <div className="text-center">
                  <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-accent border-r-transparent" />
                  <div className="mt-3 text-sm text-fg-muted">Pidiendo próximas earnings al provider…</div>
                </div>
              )}
              {state === "error" && (
                <div className="rounded-md border border-neg/40 bg-neg/10 p-4 text-sm">
                  <div className="font-medium text-neg mb-1">No se pudo refrescar</div>
                  <div className="text-fg-muted whitespace-pre-wrap">{error ?? "Error desconocido"}</div>
                </div>
              )}
              {state === "done" && result && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="rounded border border-border bg-bg-elevated p-3">
                      <div className="text-2xs uppercase text-fg-muted">Upserted</div>
                      <div className="text-base font-semibold numeric mt-1 text-pos">{result.upserted}</div>
                    </div>
                    <div className="rounded border border-border bg-bg-elevated p-3">
                      <div className="text-2xs uppercase text-fg-muted">Errores</div>
                      <div className="text-base font-semibold numeric mt-1 text-neg">{result.errors}</div>
                    </div>
                    <div className="rounded border border-border bg-bg-elevated p-3">
                      <div className="text-2xs uppercase text-fg-muted">Provider</div>
                      <div className="text-base font-semibold numeric mt-1">{result.provider}</div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead className="border-b border-border bg-bg-elevated/60">
                        <tr>
                          <th className="text-left px-2 py-1.5 text-2xs uppercase text-fg-muted">Ticker</th>
                          <th className="text-left px-2 py-1.5 text-2xs uppercase text-fg-muted">Estado</th>
                          <th className="text-left px-2 py-1.5 text-2xs uppercase text-fg-muted">Fecha</th>
                          <th className="text-left px-2 py-1.5 text-2xs uppercase text-fg-muted">Periodo</th>
                          <th className="text-left px-2 py-1.5 text-2xs uppercase text-fg-muted">Error</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle">
                        {result.items.map((p, i) => (
                          <tr key={`${p.ticker}-${i}`}>
                            <td className="px-2 py-1.5 font-medium">{p.ticker}</td>
                            <td className="px-2 py-1.5">
                              <Badge tone={p.status === "upserted" ? "pos" : "neg"}>{p.status}</Badge>
                            </td>
                            <td className="px-2 py-1.5 numeric text-fg-muted">{p.date ?? "—"}</td>
                            <td className="px-2 py-1.5 text-fg-muted">{p.period ?? "—"}</td>
                            <td className="px-2 py-1.5 text-2xs text-neg">{p.error ?? ""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
