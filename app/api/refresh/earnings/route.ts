import { NextResponse, type NextRequest } from "next/server";
import { refreshEarnings } from "@/lib/market/refresh-earnings";
import { checkCronAuth } from "@/lib/auth/cron";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/refresh/earnings
 *
 * For each position, fetch the next upcoming earnings date from the
 * configured provider and upsert into `CalendarEvent` as a forward-
 * looking event. Future earnings rows for these tickers are dropped
 * and re-inserted so dates shift correctly.
 *
 * Body (optional): `{ "lookaheadDays": 120 }`
 */
export async function POST(req: NextRequest) {
  const unauth = checkCronAuth(req);
  if (unauth) return unauth;

  let body: { lookaheadDays?: number } = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {
    // defaults
  }

  try {
    const result = await refreshEarnings({ lookaheadDays: body.lookaheadDays });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Refresh failed";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
