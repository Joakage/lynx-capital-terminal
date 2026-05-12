import { prisma, hasDatabase, getDefaultPortfolioId } from "@/lib/db";
import { getEarningsProvider } from "./earnings-factory";

export interface EarningsRefreshResult {
  ok: boolean;
  provider: string;
  durationMs: number;
  asOf: string;
  upserted: number;
  errors: number;
  items: Array<{
    ticker: string;
    status: "upserted" | "error";
    date?: string;
    period?: string;
    error?: string;
  }>;
  message?: string;
}

/**
 * Fetch the earliest upcoming earnings date for every position and
 * upsert it into `CalendarEvent` as a forward-looking event with
 * id "earnings-{ticker}-{date}". Idempotent: the same date is
 * overwritten if it shifts.
 *
 * Also clears stale rows: any earnings event whose id starts with
 * "earnings-{ticker}-" and whose date is in the past gets left alone
 * (history). Future earnings events with a different date for the
 * same ticker are deleted so we only ever store the next one.
 */
export async function refreshEarnings(
  opts: { lookaheadDays?: number } = {},
): Promise<EarningsRefreshResult> {
  const startedAt = Date.now();
  const asOf = new Date().toISOString();
  const lookaheadDays = opts.lookaheadDays ?? 120;

  if (!hasDatabase()) {
    return base("—", startedAt, asOf, {
      ok: false,
      message: "DATABASE_URL no configurado — refresh requiere Postgres.",
    });
  }
  const portfolioId = await getDefaultPortfolioId();
  if (!portfolioId) {
    return base("—", startedAt, asOf, {
      ok: false,
      message: "No hay portfolio. Ejecuta `npm run db:seed`.",
    });
  }
  const positionRows = await prisma.position.findMany({
    where: { portfolioId },
    orderBy: { weight: "desc" },
  });
  if (positionRows.length === 0) {
    return base("—", startedAt, asOf, { ok: false, message: "Sin posiciones." });
  }
  const tickers = positionRows.map((p) => p.ticker);

  let provider: ReturnType<typeof getEarningsProvider>;
  try {
    provider = getEarningsProvider();
  } catch (err) {
    return base("—", startedAt, asOf, {
      ok: false,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  const fetchRes = await provider.getUpcoming(tickers, lookaheadDays);
  const fetchErrors = new Map(fetchRes.errors.map((e) => [e.ticker, e.error]));

  const todayStart = new Date(new Date().toISOString().slice(0, 10));

  // Drop existing future earnings events for these tickers so we can
  // re-insert with the current date (no orphan rows if a date shifts).
  await prisma.calendarEvent.deleteMany({
    where: {
      ticker: { in: tickers },
      type: "Earnings",
      date: { gte: todayStart },
    },
  });

  const items: EarningsRefreshResult["items"] = [];
  let upserted = 0;
  let errors = 0;

  for (const [ticker, err] of fetchErrors) {
    errors++;
    items.push({ ticker, status: "error", error: err });
  }

  for (const u of fetchRes.items) {
    const id = `earnings-${u.ticker}-${u.date}`;
    try {
      await prisma.calendarEvent.upsert({
        where: { id },
        update: {
          date: new Date(u.date),
          ticker: u.ticker,
          title: u.period ? `Earnings ${u.period}` : "Earnings",
          type: "Earnings",
          importance: "Alta",
          notes: u.epsEstimate !== undefined
            ? `EPS est. ${u.epsEstimate.toFixed(2)}${u.revenueEstimate ? ` · revenue est. ${(u.revenueEstimate / 1e9).toFixed(2)}B` : ""}`
            : undefined,
        },
        create: {
          id,
          date: new Date(u.date),
          ticker: u.ticker,
          title: u.period ? `Earnings ${u.period}` : "Earnings",
          type: "Earnings",
          importance: "Alta",
          notes: u.epsEstimate !== undefined
            ? `EPS est. ${u.epsEstimate.toFixed(2)}${u.revenueEstimate ? ` · revenue est. ${(u.revenueEstimate / 1e9).toFixed(2)}B` : ""}`
            : undefined,
        },
      });
      upserted++;
      items.push({ ticker: u.ticker, status: "upserted", date: u.date, period: u.period });
    } catch (e) {
      errors++;
      items.push({
        ticker: u.ticker,
        status: "error",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return {
    ok: true,
    provider: provider.id,
    durationMs: Date.now() - startedAt,
    asOf,
    upserted,
    errors,
    items,
  };
}

function base(
  provider: string,
  startedAt: number,
  asOf: string,
  override: Partial<EarningsRefreshResult>,
): EarningsRefreshResult {
  return {
    ok: false,
    provider,
    durationMs: Date.now() - startedAt,
    asOf,
    upserted: 0,
    errors: 0,
    items: [],
    ...override,
  };
}
