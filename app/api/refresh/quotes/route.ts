import { NextResponse } from "next/server";
import { refreshQuotes } from "@/lib/market/refresh";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/refresh/quotes
 *
 * Refreshes every position in the default portfolio against the
 * configured market data provider (Yahoo by default, FMP if
 * MARKET_DATA_PROVIDER=fmp + FMP_API_KEY set). Updates Position rows,
 * upserts today's NavPoint and a fresh PortfolioKpi snapshot.
 *
 * Body is ignored. No auth — gate at the edge if you expose publicly.
 */
export async function POST() {
  try {
    const result = await refreshQuotes();
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Refresh failed";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Use POST para disparar el refresh." },
    { status: 405 },
  );
}
