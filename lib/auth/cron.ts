import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Gate the refresh endpoints.
 *
 * Three modes:
 *
 *   1. `CRON_SECRET` unset → no auth. Anyone can hit. Fine for local dev.
 *   2. `CRON_SECRET` set, request is same-origin → allowed (browser button).
 *      We check that the `origin` header host matches the `host` header.
 *      Vercel injects both for fetches initiated by your own pages.
 *   3. `CRON_SECRET` set, request carries `Authorization: Bearer ${secret}` →
 *      allowed. This is what Vercel Cron and external schedulers should use.
 *
 * Returns `null` when the request is authorised, or a 401 NextResponse
 * the route handler should return as-is.
 */
export function checkCronAuth(req: NextRequest): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) return null;

  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return null;

  // Same-origin browser fetch (e.g. the button in /control): no Authorization
  // header but origin matches host. Reject cross-origin POSTs.
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host === host) return null;
    } catch {
      // bad origin header → fall through to 401
    }
  }

  return NextResponse.json(
    { error: "Unauthorized. Send `Authorization: Bearer ${CRON_SECRET}` or call from same origin." },
    { status: 401 },
  );
}
