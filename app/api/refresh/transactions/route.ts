import { NextResponse, type NextRequest } from "next/server";
import { refreshIbkrTransactions } from "@/lib/ibkr/refresh";
import { checkCronAuth } from "@/lib/auth/cron";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * POST /api/refresh/transactions
 *
 * Pull trades from IBKR Flex Query (IBKR_FLEX_TOKEN + IBKR_FLEX_QUERY_ID)
 * and upsert them into the Transaction table. Idempotent on the IBKR
 * tradeID — re-running never duplicates a fill.
 *
 * Auto-creates any Company row whose ticker isn't in the DB so the
 * Transaction.ticker → Company.ticker FK doesn't fail. You can edit
 * those stubs in /companies/<ticker> later.
 */
export async function POST(req: NextRequest) {
  const unauth = checkCronAuth(req);
  if (unauth) return unauth;
  try {
    const result = await refreshIbkrTransactions();
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Refresh failed";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
