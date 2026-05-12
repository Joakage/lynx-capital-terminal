import { NextResponse, type NextRequest } from "next/server";
import { refreshNews } from "@/lib/news/refresh";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Classification is slow (~5-15s per article × N positions). Bump the
// route timeout where the platform honours it (Vercel/edge).
export const maxDuration = 300;

/**
 * POST /api/refresh/news
 *
 * For every position in the default portfolio: fetch recent news from
 * the configured provider (yahoo by default, fmp via FMP_API_KEY),
 * classify each new article with Claude (sentiment + thesisImpact +
 * category against the active thesis), insert into the `News` table.
 *
 * Body (optional JSON):
 *   { "lookbackDays": 7, "maxClassifications": 40 }
 */
export async function POST(req: NextRequest) {
  let body: { lookbackDays?: number; maxClassifications?: number } = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {
    // ignore; defaults below
  }

  try {
    const result = await refreshNews({
      lookbackDays: body.lookbackDays,
      maxClassifications: body.maxClassifications,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Refresh failed";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Use POST para disparar el refresh de noticias." },
    { status: 405 },
  );
}
