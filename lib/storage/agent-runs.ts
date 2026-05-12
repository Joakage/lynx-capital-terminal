import fs from "fs/promises";
import path from "path";
import { hasDatabase, prisma } from "@/lib/db";

export interface AgentRunRecord {
  id: string;
  skillId: string;
  skillName: string;
  area: string;
  ticker?: string;
  sector?: string;
  question?: string;
  model: string;
  startedAt: string;
  elapsedMs: number;
  status: "Completado" | "Error";
  stopReason: string;
  output: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationInputTokens: number;
    cacheReadInputTokens: number;
  };
}

const RUNS_DIR = path.join(process.cwd(), "data", "agent-runs");

async function ensureDir() {
  await fs.mkdir(RUNS_DIR, { recursive: true });
}

// ─── DB path ───────────────────────────────────────────────

async function saveRunDB(run: AgentRunRecord): Promise<void> {
  await prisma.agentRun.upsert({
    where: { id: run.id },
    update: {
      skillId: run.skillId,
      skillName: run.skillName,
      area: run.area,
      ticker: run.ticker,
      sector: run.sector,
      question: run.question,
      model: run.model,
      startedAt: new Date(run.startedAt),
      elapsedMs: run.elapsedMs,
      status: run.status,
      stopReason: run.stopReason,
      output: run.output,
      inputTokens: run.usage.inputTokens,
      outputTokens: run.usage.outputTokens,
      cacheCreationInputTokens: run.usage.cacheCreationInputTokens,
      cacheReadInputTokens: run.usage.cacheReadInputTokens,
    },
    create: {
      id: run.id,
      skillId: run.skillId,
      skillName: run.skillName,
      area: run.area,
      ticker: run.ticker,
      sector: run.sector,
      question: run.question,
      model: run.model,
      startedAt: new Date(run.startedAt),
      elapsedMs: run.elapsedMs,
      status: run.status,
      stopReason: run.stopReason,
      output: run.output,
      inputTokens: run.usage.inputTokens,
      outputTokens: run.usage.outputTokens,
      cacheCreationInputTokens: run.usage.cacheCreationInputTokens,
      cacheReadInputTokens: run.usage.cacheReadInputTokens,
    },
  });
}

async function getRunDB(id: string): Promise<AgentRunRecord | null> {
  const r = await prisma.agentRun.findUnique({ where: { id } });
  if (!r) return null;
  return {
    id: r.id,
    skillId: r.skillId,
    skillName: r.skillName,
    area: r.area,
    ticker: r.ticker ?? undefined,
    sector: r.sector ?? undefined,
    question: r.question ?? undefined,
    model: r.model,
    startedAt: r.startedAt.toISOString(),
    elapsedMs: r.elapsedMs,
    status: r.status as AgentRunRecord["status"],
    stopReason: r.stopReason,
    output: r.output,
    usage: {
      inputTokens: r.inputTokens,
      outputTokens: r.outputTokens,
      cacheCreationInputTokens: r.cacheCreationInputTokens,
      cacheReadInputTokens: r.cacheReadInputTokens,
    },
  };
}

async function listRunsDB(limit: number): Promise<AgentRunRecord[]> {
  const rows = await prisma.agentRun.findMany({
    orderBy: { startedAt: "desc" },
    take: limit,
  });
  return rows.map((r) => ({
    id: r.id,
    skillId: r.skillId,
    skillName: r.skillName,
    area: r.area,
    ticker: r.ticker ?? undefined,
    sector: r.sector ?? undefined,
    question: r.question ?? undefined,
    model: r.model,
    startedAt: r.startedAt.toISOString(),
    elapsedMs: r.elapsedMs,
    status: r.status as AgentRunRecord["status"],
    stopReason: r.stopReason,
    output: r.output,
    usage: {
      inputTokens: r.inputTokens,
      outputTokens: r.outputTokens,
      cacheCreationInputTokens: r.cacheCreationInputTokens,
      cacheReadInputTokens: r.cacheReadInputTokens,
    },
  }));
}

// ─── Filesystem path (fallback when DATABASE_URL unset) ─────────────

async function saveRunFS(run: AgentRunRecord): Promise<void> {
  await ensureDir();
  const file = path.join(RUNS_DIR, `${run.id}.json`);
  await fs.writeFile(file, JSON.stringify(run, null, 2), "utf8");
}

async function getRunFS(id: string): Promise<AgentRunRecord | null> {
  try {
    const file = path.join(RUNS_DIR, `${id}.json`);
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as AgentRunRecord;
  } catch {
    return null;
  }
}

async function listRunsFS(limit: number): Promise<AgentRunRecord[]> {
  try {
    await ensureDir();
    const files = await fs.readdir(RUNS_DIR);
    const records = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map(async (f) => {
          try {
            const raw = await fs.readFile(path.join(RUNS_DIR, f), "utf8");
            return JSON.parse(raw) as AgentRunRecord;
          } catch {
            return null;
          }
        }),
    );
    return records
      .filter((r): r is AgentRunRecord => r !== null)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
      .slice(0, limit);
  } catch {
    return [];
  }
}

// ─── Public API ────────────────────────────────────────────

export async function saveRun(run: AgentRunRecord): Promise<void> {
  if (hasDatabase()) return saveRunDB(run);
  return saveRunFS(run);
}

export async function getRun(id: string): Promise<AgentRunRecord | null> {
  if (hasDatabase()) return getRunDB(id);
  return getRunFS(id);
}

export async function listRuns(limit = 50): Promise<AgentRunRecord[]> {
  if (hasDatabase()) return listRunsDB(limit);
  return listRunsFS(limit);
}
