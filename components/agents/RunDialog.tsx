"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MarkdownView } from "./MarkdownView";
import { cn } from "@/lib/utils";

export interface RunResult {
  id: string;
  skillName: string;
  ticker?: string;
  model: string;
  startedAt: string;
  elapsedMs: number;
  output: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationInputTokens: number;
    cacheReadInputTokens: number;
  };
  status: "Completado" | "Error";
}

export function RunDialog({
  open,
  onClose,
  state,
  run,
  error,
  meta,
}: {
  open: boolean;
  onClose: () => void;
  state: "loading" | "done" | "error";
  run: RunResult | null;
  error: string | null;
  meta: { skillName: string; skillId: string; ticker?: string; sector?: string };
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && state !== "loading") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, state]);

  if (!open) return null;

  const copyToClipboard = () => {
    if (!run) return;
    void navigator.clipboard.writeText(run.output);
  };

  const downloadMarkdown = () => {
    if (!run) return;
    const blob = new Blob([run.output], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${run.skillName}${run.ticker ? "_" + run.ticker : ""}_${run.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={() => state !== "loading" && onClose()}
    >
      <div
        className="bg-bg-panel border border-border rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-5 py-3 shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold tracking-tight">
                <code className="text-accent">{meta.skillName}</code>
              </h3>
              {meta.ticker && <Badge tone="accent">{meta.ticker}</Badge>}
              {meta.sector && <Badge tone="muted">{meta.sector}</Badge>}
              {run && <Badge tone={run.status === "Completado" ? "pos" : "neg"}>{run.status}</Badge>}
            </div>
            {run && (
              <div className="mt-1 text-2xs text-fg-muted numeric">
                {run.model} · {(run.elapsedMs / 1000).toFixed(1)}s · in {run.usage.inputTokens.toLocaleString()} · out {run.usage.outputTokens.toLocaleString()} · cache w/r {run.usage.cacheCreationInputTokens.toLocaleString()}/{run.usage.cacheReadInputTokens.toLocaleString()}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {state === "done" && run && (
              <>
                <Button size="sm" onClick={copyToClipboard}>Copiar</Button>
                <Button size="sm" onClick={downloadMarkdown}>Descargar .md</Button>
              </>
            )}
            <Button size="sm" variant="ghost" onClick={onClose} disabled={state === "loading"}>
              ✕
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className={cn("flex-1 overflow-y-auto px-5 py-4", state === "loading" && "flex items-center justify-center")}>
          {state === "loading" && (
            <div className="text-center">
              <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-accent border-r-transparent" />
              <div className="mt-3 text-sm text-fg-muted">
                Ejecutando <code className="text-accent">{meta.skillName}</code>
                {meta.ticker && <> sobre <span className="text-fg">{meta.ticker}</span></>}…
              </div>
              <div className="mt-1 text-2xs text-fg-subtle">Contexto cacheado · puede tardar 20-60s con thinking adaptativo</div>
            </div>
          )}
          {state === "error" && (
            <div className="rounded-md border border-neg/40 bg-neg/10 p-4 text-sm">
              <div className="font-medium text-neg mb-1">No se pudo ejecutar la skill</div>
              <div className="text-fg-muted whitespace-pre-wrap">{error ?? "Error desconocido"}</div>
              <div className="mt-3 text-2xs text-fg-subtle">
                ¿Has configurado <code>ANTHROPIC_API_KEY</code> en <code>.env.local</code>?
              </div>
            </div>
          )}
          {state === "done" && run && <MarkdownView text={run.output} />}
        </div>
      </div>
    </div>
  );
}
