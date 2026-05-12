"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { RunDialog, type RunResult } from "./RunDialog";

export function RunButton({
  skillId,
  skillName,
  label,
  ticker,
  sector,
  variant = "primary",
  size = "sm",
  className,
  fullWidth = false,
}: {
  skillId: string;
  skillName: string;
  label: string;
  ticker?: string;
  sector?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  className?: string;
  fullWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"loading" | "done" | "error">("loading");
  const [run, setRun] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setOpen(true);
    setState("loading");
    setRun(null);
    setError(null);
    try {
      const resp = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId, ticker, sector }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error ?? `HTTP ${resp.status}`);
        setState("error");
        return;
      }
      setRun(data.run as RunResult);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de red");
      setState("error");
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className={`${fullWidth ? "w-full" : ""} ${className ?? ""}`}
      >
        {label}
      </Button>
      <RunDialog
        open={open}
        onClose={() => setOpen(false)}
        state={state}
        run={run}
        error={error}
        meta={{ skillName, skillId, ticker, sector }}
      />
    </>
  );
}
