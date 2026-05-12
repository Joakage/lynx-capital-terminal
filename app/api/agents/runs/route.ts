import { NextResponse } from "next/server";
import { listRuns } from "@/lib/storage/agent-runs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const runs = await listRuns(100);
  // Don't include full output in list response to keep it light
  return NextResponse.json({
    runs: runs.map((r) => ({
      id: r.id,
      skillId: r.skillId,
      skillName: r.skillName,
      area: r.area,
      ticker: r.ticker,
      model: r.model,
      startedAt: r.startedAt,
      elapsedMs: r.elapsedMs,
      status: r.status,
      stopReason: r.stopReason,
      usage: r.usage,
      preview: r.output.slice(0, 240),
    })),
  });
}
