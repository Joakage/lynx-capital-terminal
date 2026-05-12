import fs from "fs/promises";
import path from "path";

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

export async function saveRun(run: AgentRunRecord): Promise<void> {
  await ensureDir();
  const file = path.join(RUNS_DIR, `${run.id}.json`);
  await fs.writeFile(file, JSON.stringify(run, null, 2), "utf8");
}

export async function getRun(id: string): Promise<AgentRunRecord | null> {
  try {
    const file = path.join(RUNS_DIR, `${id}.json`);
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as AgentRunRecord;
  } catch {
    return null;
  }
}

export async function listRuns(limit = 50): Promise<AgentRunRecord[]> {
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
