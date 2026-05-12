import { prisma, hasDatabase, getDefaultPortfolioId } from "@/lib/db";
import { getMarketProvider } from "./factory";
import { computeKpis } from "./metrics";
import type { NavPoint, Position } from "@/lib/types";

export interface PositionRefreshResult {
  ticker: string;
  status: "updated" | "skipped" | "error";
  oldPrice?: number;
  newPrice?: number;
  pnlPct?: number;
  error?: string;
}

export interface RefreshQuotesResult {
  ok: boolean;
  provider: string;
  durationMs: number;
  asOf: string;
  navBefore: number;
  navAfter: number;
  navChange: number;
  navChangePct: number;
  cashPct: number;
  positions: PositionRefreshResult[];
  kpis: {
    daily: number;
    mtd: number;
    ytd: number;
  };
  message?: string;
}

/**
 * Refresh all positions in the default portfolio against the configured
 * market data provider, recompute portfolio NAV + cash, upsert a NavPoint
 * for today and a PortfolioKpi snapshot. Idempotent per day — running
 * twice updates the same NavPoint/KPI row.
 *
 * Requires DATABASE_URL. Without it, returns a no-op result.
 */
export async function refreshQuotes(): Promise<RefreshQuotesResult> {
  const startedAt = Date.now();
  const todayDate = new Date(new Date().toISOString().slice(0, 10));
  const asOf = todayDate.toISOString();

  if (!hasDatabase()) {
    return {
      ok: false,
      provider: "—",
      durationMs: 0,
      asOf,
      navBefore: 0,
      navAfter: 0,
      navChange: 0,
      navChangePct: 0,
      cashPct: 0,
      positions: [],
      kpis: { daily: 0, mtd: 0, ytd: 0 },
      message:
        "DATABASE_URL no configurado — refresh requiere Postgres (Fase 2B). Sin DB la cartera vive en lib/mock-data.ts y es estática.",
    };
  }

  const portfolioId = await getDefaultPortfolioId();
  if (!portfolioId) {
    return {
      ok: false,
      provider: "—",
      durationMs: 0,
      asOf,
      navBefore: 0,
      navAfter: 0,
      navChange: 0,
      navChangePct: 0,
      cashPct: 0,
      positions: [],
      kpis: { daily: 0, mtd: 0, ytd: 0 },
      message:
        "No hay portfolio en la DB. Ejecuta `npm run db:seed` para crear la cartera default.",
    };
  }

  const positionRows = await prisma.position.findMany({
    where: { portfolioId },
    orderBy: { weight: "desc" },
  });
  if (positionRows.length === 0) {
    return {
      ok: false,
      provider: "—",
      durationMs: 0,
      asOf,
      navBefore: 0,
      navAfter: 0,
      navChange: 0,
      navChangePct: 0,
      cashPct: 0,
      positions: [],
      kpis: { daily: 0, mtd: 0, ytd: 0 },
      message: "El portfolio no tiene posiciones. Ejecuta `npm run db:seed` primero.",
    };
  }

  const tickers = positionRows.map((p) => p.ticker);
  const benchmarkTicker = process.env.BENCHMARK_TICKER ?? "SPY";

  // ─── Pre-refresh totals ─────────────────────────────────
  const oldMarketValueSum = positionRows.reduce((a, p) => a + p.marketValue, 0);
  const lastKpi = await prisma.portfolioKpi.findFirst({
    where: { portfolioId },
    orderBy: { asOf: "desc" },
  });
  const lastNav = lastKpi?.navCurrent ?? oldMarketValueSum;
  const cash = Math.max(0, lastNav - oldMarketValueSum);

  // ─── Fetch quotes (positions + benchmark in a single call) ──────
  let provider: ReturnType<typeof getMarketProvider>;
  try {
    provider = getMarketProvider();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      provider: "—",
      durationMs: Date.now() - startedAt,
      asOf,
      navBefore: lastNav,
      navAfter: lastNav,
      navChange: 0,
      navChangePct: 0,
      cashPct: 0,
      positions: [],
      kpis: { daily: 0, mtd: 0, ytd: 0 },
      message: msg,
    };
  }

  const tickersIncludingBenchmark = Array.from(new Set([...tickers, benchmarkTicker]));
  const { quotes, errors } = await provider.getQuotes(tickersIncludingBenchmark);
  const quoteByTicker = new Map(quotes.map((q) => [q.ticker, q]));
  const benchmarkQuote = quoteByTicker.get(benchmarkTicker);

  // ─── Apply updates ────────────────────────────────────────
  const positionResults: PositionRefreshResult[] = [];
  let newMarketValueSum = 0;
  const updatedPositions: Position[] = [];

  for (const row of positionRows) {
    const oldPrice = row.currentPrice;
    const q = quoteByTicker.get(row.ticker);
    const providerError = errors.find((e) => e.ticker === row.ticker);

    if (!q || providerError) {
      // Carry forward old marketValue so the NAV doesn't crash
      newMarketValueSum += row.marketValue;
      updatedPositions.push({
        ticker: row.ticker,
        quantity: row.quantity,
        averageCost: row.averageCost,
        currentPrice: row.currentPrice,
        weight: row.weight,
        marketValue: row.marketValue,
        unrealizedPnl: row.unrealizedPnl,
        unrealizedPnlPct: row.unrealizedPnlPct,
        conviction: row.conviction as Position["conviction"],
        thesisStatus: row.thesisStatus as Position["thesisStatus"],
      });
      positionResults.push({
        ticker: row.ticker,
        status: providerError ? "error" : "skipped",
        oldPrice,
        error: providerError?.error ?? "Provider no devolvió cotización",
      });
      continue;
    }

    const newPrice = q.price;
    const newMarketValue = row.quantity * newPrice;
    const unrealizedPnl = (newPrice - row.averageCost) * row.quantity;
    const unrealizedPnlPct = row.averageCost > 0
      ? ((newPrice - row.averageCost) / row.averageCost) * 100
      : 0;
    newMarketValueSum += newMarketValue;

    updatedPositions.push({
      ticker: row.ticker,
      quantity: row.quantity,
      averageCost: row.averageCost,
      currentPrice: newPrice,
      weight: row.weight, // recomputed below
      marketValue: newMarketValue,
      unrealizedPnl,
      unrealizedPnlPct,
      conviction: row.conviction as Position["conviction"],
      thesisStatus: row.thesisStatus as Position["thesisStatus"],
    });
    positionResults.push({
      ticker: row.ticker,
      status: "updated",
      oldPrice,
      newPrice,
      pnlPct: +unrealizedPnlPct.toFixed(2),
    });
  }

  const newNav = newMarketValueSum + cash;
  const cashPct = newNav > 0 ? (cash / newNav) * 100 : 0;

  // Recompute weights now that we know the new NAV
  for (const p of updatedPositions) {
    p.weight = newNav > 0 ? (p.marketValue / newNav) * 100 : 0;
  }

  // ─── Persist position updates ────────────────────────────────
  for (const p of updatedPositions) {
    await prisma.position.update({
      where: { portfolioId_ticker: { portfolioId, ticker: p.ticker } },
      data: {
        currentPrice: p.currentPrice,
        marketValue: p.marketValue,
        unrealizedPnl: p.unrealizedPnl,
        unrealizedPnlPct: p.unrealizedPnlPct,
        weight: p.weight,
      },
    });
  }

  // ─── Build the new NAV series (move benchmark with its daily change) ─
  const navRows = await prisma.navPoint.findMany({
    where: { portfolioId },
    orderBy: { date: "asc" },
  });
  const lastBenchmarkValue = navRows.length > 0
    ? navRows[navRows.length - 1].benchmark
    : 100;

  let newBenchmarkValue = lastBenchmarkValue;
  if (
    benchmarkQuote?.price &&
    benchmarkQuote.previousClose &&
    benchmarkQuote.previousClose > 0
  ) {
    const dailyMove = benchmarkQuote.price / benchmarkQuote.previousClose;
    newBenchmarkValue = lastBenchmarkValue * dailyMove;
  }

  await prisma.navPoint.upsert({
    where: { portfolioId_date: { portfolioId, date: todayDate } },
    update: { portfolioNav: newNav, benchmark: newBenchmarkValue },
    create: {
      portfolioId,
      date: todayDate,
      portfolioNav: newNav,
      benchmark: newBenchmarkValue,
    },
  });

  const navSeries: NavPoint[] = [
    ...navRows
      .filter((p) => p.date.toISOString().slice(0, 10) !== todayDate.toISOString().slice(0, 10))
      .map((p) => ({
        date: p.date.toISOString().slice(0, 10),
        portfolio: p.portfolioNav,
        benchmark: p.benchmark,
      })),
    {
      date: todayDate.toISOString().slice(0, 10),
      portfolio: newNav,
      benchmark: newBenchmarkValue,
    },
  ];

  // ─── Recompute + persist KPI snapshot ────────────────────────
  const inceptionDate = navSeries[0]?.date ?? todayDate.toISOString().slice(0, 10);
  const navInception = navSeries[0]?.portfolio ?? newNav;
  const kpis = computeKpis({
    navSeries,
    positions: updatedPositions,
    cashPct,
    inceptionDate,
    navInception,
  });

  await prisma.portfolioKpi.upsert({
    where: { portfolioId_asOf: { portfolioId, asOf: todayDate } },
    update: { ...kpis, inceptionDate: new Date(kpis.inceptionDate) },
    create: {
      portfolioId,
      asOf: todayDate,
      ...kpis,
      inceptionDate: new Date(kpis.inceptionDate),
    },
  });

  const durationMs = Date.now() - startedAt;

  return {
    ok: true,
    provider: provider.id,
    durationMs,
    asOf,
    navBefore: lastNav,
    navAfter: newNav,
    navChange: newNav - lastNav,
    navChangePct: lastNav > 0 ? ((newNav / lastNav) - 1) * 100 : 0,
    cashPct,
    positions: positionResults,
    kpis: {
      daily: kpis.dailyReturnPct,
      mtd: kpis.mtdPct,
      ytd: kpis.ytdPct,
    },
  };
}
