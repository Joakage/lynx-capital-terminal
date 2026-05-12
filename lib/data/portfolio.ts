import { prisma, hasDatabase, getDefaultPortfolioId } from "@/lib/db";
import * as mock from "@/lib/mock-data";
import type {
  Position, Transaction, PortfolioKPIs, NavPoint, MonthlyReturn, AnnualReturn,
} from "@/lib/types";

export async function getKpis(): Promise<PortfolioKPIs> {
  if (!hasDatabase()) return mock.kpis;
  const pid = await getDefaultPortfolioId();
  if (!pid) return mock.kpis;
  const row = await prisma.portfolioKpi.findFirst({
    where: { portfolioId: pid },
    orderBy: { asOf: "desc" },
  });
  if (!row) return mock.kpis;
  return {
    navCurrent: row.navCurrent,
    navInception: row.navInception,
    inceptionDate: row.inceptionDate.toISOString().slice(0, 10),
    dailyReturnPct: row.dailyReturnPct,
    mtdPct: row.mtdPct,
    ytdPct: row.ytdPct,
    cumulativePct: row.cumulativePct,
    benchmarkYtdPct: row.benchmarkYtdPct,
    alphaYtdPct: row.alphaYtdPct,
    volAnnualizedPct: row.volAnnualizedPct,
    sharpe: row.sharpe,
    sortino: row.sortino,
    calmar: row.calmar,
    maxDrawdownPct: row.maxDrawdownPct,
    currentDrawdownPct: row.currentDrawdownPct,
    beta: row.beta,
    trackingErrorPct: row.trackingErrorPct,
    informationRatio: row.informationRatio,
    cashPct: row.cashPct,
    herfindahl: row.herfindahl,
  };
}

export async function getPositions(): Promise<Position[]> {
  if (!hasDatabase()) return mock.positions;
  const pid = await getDefaultPortfolioId();
  if (!pid) return mock.positions;
  const rows = await prisma.position.findMany({
    where: { portfolioId: pid },
    orderBy: { weight: "desc" },
  });
  if (rows.length === 0) return mock.positions;
  return rows.map((r) => ({
    ticker: r.ticker,
    quantity: r.quantity,
    averageCost: r.averageCost,
    currentPrice: r.currentPrice,
    weight: r.weight,
    marketValue: r.marketValue,
    unrealizedPnl: r.unrealizedPnl,
    unrealizedPnlPct: r.unrealizedPnlPct,
    conviction: r.conviction as Position["conviction"],
    thesisStatus: r.thesisStatus as Position["thesisStatus"],
  }));
}

export async function getTransactions(): Promise<Transaction[]> {
  if (!hasDatabase()) return mock.transactions;
  const pid = await getDefaultPortfolioId();
  if (!pid) return mock.transactions;
  const rows = await prisma.transaction.findMany({
    where: { portfolioId: pid },
    orderBy: { date: "desc" },
  });
  if (rows.length === 0) return mock.transactions;
  return rows.map((r) => ({
    id: r.id,
    date: r.date.toISOString().slice(0, 10),
    type: r.type as Transaction["type"],
    ticker: r.ticker,
    side: r.side as Transaction["side"],
    quantity: r.quantity,
    price: r.price,
    fees: r.fees,
    currency: r.currency,
    rationale: r.rationale ?? undefined,
    thesisId: r.thesisId ?? undefined,
  }));
}

export async function getNavSeries(): Promise<NavPoint[]> {
  if (!hasDatabase()) return mock.navSeries;
  const pid = await getDefaultPortfolioId();
  if (!pid) return mock.navSeries;
  const rows = await prisma.navPoint.findMany({
    where: { portfolioId: pid },
    orderBy: { date: "asc" },
  });
  if (rows.length === 0) return mock.navSeries;
  return rows.map((r) => ({
    date: r.date.toISOString().slice(0, 10),
    portfolio: r.portfolioNav,
    benchmark: r.benchmark,
  }));
}

export async function getMonthlyReturns(): Promise<MonthlyReturn[]> {
  // Derived from NAV series — same logic regardless of source.
  const nav = await getNavSeries();
  const last12 = nav.slice(-12);
  return last12.map((p, i, arr) => {
    if (i === 0) return { month: p.date.slice(0, 7), portfolio: 0, benchmark: 0 };
    return {
      month: p.date.slice(0, 7),
      portfolio: +(((p.portfolio / arr[i - 1].portfolio) - 1) * 100).toFixed(2),
      benchmark: +(((p.benchmark / arr[i - 1].benchmark) - 1) * 100).toFixed(2),
    };
  });
}

export async function getAnnualReturns(): Promise<AnnualReturn[]> {
  if (!hasDatabase()) return mock.annualReturns;
  const pid = await getDefaultPortfolioId();
  if (!pid) return mock.annualReturns;
  const rows = await prisma.annualReturn.findMany({
    where: { portfolioId: pid },
    orderBy: { year: "asc" },
  });
  if (rows.length === 0) return mock.annualReturns;
  return rows.map((r) => ({
    year: r.year,
    portfolio: r.portfolioReturn,
    benchmark: r.benchmark,
  }));
}
