"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn, sentimentColor } from "@/lib/utils";

interface NewsItemResult {
  ticker: string;
  externalId: string;
  status: "inserted" | "skipped" | "classify-error" | "fetch-error";
  title?: string;
  source?: string;
  sentiment?: "Positivo" | "Neutro" | "Negativo";
  thesisImpact?: "Refuerza" | "Neutro" | "Vigilar" | "Invalida";
  category?: string;
  reasoning?: string;
  error?: string;
}

interface RefreshNewsResponse {
  ok: boolean;
  provider: string;
  model: string;
  durationMs: number;
  asOf: string;
  fetched: number;
  newCandidates: number;
  inserted: number;
  classifyErrors: number;
  items: NewsItemResult[];
  message?: string;
}

const impactTone: Record<string, "pos" | "warn" | "neg" | "muted"> = {
  Refuerza: "pos",
  Vigilar: "warn",
  Invalida: "neg",
  Neutro: "muted",
};

export function RefreshNewsButton({
  label = "Refresh news (IA)",
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
  const [result, setResult] = useState<RefreshNewsResponse | null>(null);
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
      const resp = await fetch("/api/refresh/news", { method: "POST" });
      const data = (await resp.json()) as RefreshNewsResponse;
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
            className="bg-bg-panel border border-border rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-5 py-3 shrink-0">
              <div>
                <h3 className="text-sm font-semibold tracking-tight">Refresh de noticias + clasificación IA</h3>
                {result && (
                  <div className="mt-1 text-2xs text-fg-muted numeric">
                    {result.provider} · {result.model} · {(result.durationMs / 1000).toFixed(1)}s ·
                    {" "}{result.inserted} nuevas / {result.fetched} fetched
                  </div>
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)} disabled={state === "loading"}>✕</Button>
            </div>

            <div className={cn("flex-1 overflow-y-auto px-5 py-4", state === "loading" && "flex items-center justify-center")}>
              {state === "loading" && (
                <div className="text-center">
                  <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-accent border-r-transparent" />
                  <div className="mt-3 text-sm text-fg-muted">
                    Fetcheando noticias y pidiéndole a Claude que las clasifique contra cada tesis…
                  </div>
                  <div className="mt-1 text-2xs text-fg-subtle">
                    Es lento: ~5–15 s por artículo × N posiciones. 1–3 min en total es normal.
                  </div>
                </div>
              )}

              {state === "error" && (
                <div className="rounded-md border border-neg/40 bg-neg/10 p-4 text-sm">
                  <div className="font-medium text-neg mb-1">No se pudo refrescar</div>
                  <div className="text-fg-muted whitespace-pre-wrap">{error ?? "Error desconocido"}</div>
                  <div className="mt-3 text-2xs text-fg-subtle">
                    Causas habituales: <code>ANTHROPIC_API_KEY</code> / <code>DATABASE_URL</code> sin configurar,
                    <code> FMP_API_KEY</code> ausente si <code>NEWS_PROVIDER=fmp</code>, o rate-limit del provider.
                  </div>
                </div>
              )}

              {state === "done" && result && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded border border-border bg-bg-elevated p-3">
                      <div className="text-2xs uppercase text-fg-muted">Fetched</div>
                      <div className="text-base font-semibold numeric mt-1">{result.fetched}</div>
                    </div>
                    <div className="rounded border border-border bg-bg-elevated p-3">
                      <div className="text-2xs uppercase text-fg-muted">Nuevas</div>
                      <div className="text-base font-semibold numeric mt-1">{result.newCandidates}</div>
                    </div>
                    <div className="rounded border border-border bg-bg-elevated p-3">
                      <div className="text-2xs uppercase text-fg-muted">Insertadas</div>
                      <div className="text-base font-semibold numeric mt-1 text-pos">{result.inserted}</div>
                    </div>
                    <div className="rounded border border-border bg-bg-elevated p-3">
                      <div className="text-2xs uppercase text-fg-muted">Errores clasificación</div>
                      <div className="text-base font-semibold numeric mt-1 text-neg">{result.classifyErrors}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold tracking-tight mb-2">Resultados</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead className="border-b border-border bg-bg-elevated/60">
                          <tr>
                            <th className="text-left px-2 py-1.5 text-2xs uppercase text-fg-muted">Ticker</th>
                            <th className="text-left px-2 py-1.5 text-2xs uppercase text-fg-muted">Título</th>
                            <th className="text-left px-2 py-1.5 text-2xs uppercase text-fg-muted">Estado</th>
                            <th className="text-left px-2 py-1.5 text-2xs uppercase text-fg-muted">Sentiment</th>
                            <th className="text-left px-2 py-1.5 text-2xs uppercase text-fg-muted">Impacto</th>
                            <th className="text-left px-2 py-1.5 text-2xs uppercase text-fg-muted">Categoría</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                          {result.items
                            .slice()
                            .sort((a, b) => {
                              const order: Record<string, number> = { inserted: 0, "classify-error": 1, "fetch-error": 2, skipped: 3 };
                              return (order[a.status] ?? 99) - (order[b.status] ?? 99);
                            })
                            .map((p, i) => (
                              <tr key={`${p.externalId}-${i}`}>
                                <td className="px-2 py-1.5 font-medium">{p.ticker}</td>
                                <td className="px-2 py-1.5 max-w-md truncate" title={p.title}>
                                  {p.title ?? "—"}
                                  {p.source && <span className="text-fg-subtle text-2xs ml-2">{p.source}</span>}
                                  {p.reasoning && (
                                    <div className="text-2xs text-fg-muted truncate" title={p.reasoning}>
                                      → {p.reasoning}
                                    </div>
                                  )}
                                  {p.error && (
                                    <div className="text-2xs text-neg truncate" title={p.error}>
                                      {p.error}
                                    </div>
                                  )}
                                </td>
                                <td className="px-2 py-1.5">
                                  <Badge
                                    tone={
                                      p.status === "inserted" ? "pos" :
                                      p.status === "skipped" ? "muted" :
                                      "neg"
                                    }
                                  >
                                    {p.status}
                                  </Badge>
                                </td>
                                <td className="px-2 py-1.5">
                                  {p.sentiment && (
                                    <span className={`inline-flex rounded border px-1.5 py-0.5 text-2xs uppercase font-medium ${sentimentColor(p.sentiment)}`}>
                                      {p.sentiment}
                                    </span>
                                  )}
                                </td>
                                <td className="px-2 py-1.5">
                                  {p.thesisImpact && (
                                    <Badge tone={impactTone[p.thesisImpact] ?? "muted"}>{p.thesisImpact}</Badge>
                                  )}
                                </td>
                                <td className="px-2 py-1.5 text-fg-muted">{p.category ?? "—"}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {result.message && (
                    <div className="rounded border border-warn/40 bg-warn/10 p-3 text-2xs text-fg-muted">
                      {result.message}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
