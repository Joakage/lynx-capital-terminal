"use client";

import { Badge } from "@/components/ui/Badge";
import { RunButton } from "./RunButton";

export interface SkillCardProps {
  id: string;
  name: string;
  description: string;
  buttonLabel: string;
  output: string;
  runnable: boolean;
  ticker?: string;
  sector?: string;
}

export function SkillCard({ id, name, description, buttonLabel, output, runnable, ticker, sector }: SkillCardProps) {
  return (
    <div id={id} className="rounded-lg border border-border bg-bg-panel p-3 hover:border-border/80 transition-colors flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-1">
        <code className="text-2xs text-accent">{name}</code>
        <Badge tone="muted">{output}</Badge>
      </div>
      <p className="text-sm text-fg leading-snug flex-1">{description}</p>
      <div className="flex justify-end mt-3">
        {runnable ? (
          <RunButton skillId={id} skillName={name} label={buttonLabel} ticker={ticker} sector={sector} />
        ) : (
          <span className="text-2xs text-fg-subtle italic">Pendiente conectar</span>
        )}
      </div>
    </div>
  );
}
