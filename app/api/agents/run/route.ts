import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { runSkill } from "@/lib/anthropic/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RunRequest {
  skillId: string;
  ticker?: string;
  sector?: string;
  question?: string;
}

export async function POST(req: NextRequest) {
  let body: RunRequest;
  try {
    body = (await req.json()) as RunRequest;
  } catch {
    return NextResponse.json({ error: "Body inválido (esperado JSON)" }, { status: 400 });
  }

  if (!body.skillId) {
    return NextResponse.json({ error: "Falta skillId" }, { status: 400 });
  }

  try {
    const result = await runSkill(body.skillId, {
      ticker: body.ticker,
      sector: body.sector,
      question: body.question,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Anthropic API ${err.status}: ${err.message}` },
        { status: err.status ?? 500 },
      );
    }
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
