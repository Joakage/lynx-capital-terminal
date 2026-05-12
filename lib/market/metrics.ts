import type { PortfolioKPIs, NavPoint, Position } from "@/lib/types";

/**
 * Compute the full PortfolioKPIs snapshot from a NAV series + positions
 * + cash level. Pure function: no I/O, deterministic.
 *
 * Assumes navSeries is sorted ascending by date and includes the latest
 * data point (today's NAV). Benchmark series uses the same shape.
 *
 * Risk-free rate is hardcoded to 0 for now — easy to thread through
 * env later.
 */
export function computeKpis(args: {
  navSeries: NavPoint[];
  positions: Position[];
  cashPct: number;
  inceptionDate: string;
  navInception: number;
}): PortfolioKPIs {
  const { navSeries, positions, cashPct, inceptionDate, navInception } = args;

  if (navSeries.length === 0) {
    throw new Error("computeKpis requires at least one NAV point");
  }

  const sorted = [...navSeries].sort((a, b) => a.date.localeCompare(b.date));
  const last = sorted[sorted.length - 1];
  const navCurrent = last.portfolio;

  // ─── Period returns ─────────────────────────────────────
  const prev = sorted[sorted.length - 2];
  const dailyReturnPct = prev ? (last.portfolio / prev.portfolio - 1) * 100 : 0;

  const todayDate = new Date(last.date);
  const firstOfMonth = sorted
    .slice()
    .reverse()
    .find((p) => {
      const d = new Date(p.date);
      return d.getUTCFullYear() < todayDate.getUTCFullYear() ||
        (d.getUTCFullYear() === todayDate.getUTCFullYear() &&
          d.getUTCMonth() < todayDate.getUTCMonth());
    });
  const mtdPct = firstOfMonth
    ? (last.portfolio / firstOfMonth.portfolio - 1) * 100
    : 0;

  const firstOfYear = sorted
    .slice()
    .reverse()
    .find((p) => new Date(p.date).getUTCFullYear() < todayDate.getUTCFullYear());
  const ytdPct = firstOfYear
    ? (last.portfolio / firstOfYear.portfolio - 1) * 100
    : 0;

  const benchmarkFirstOfYear = firstOfYear;
  const benchmarkYtdPct = benchmarkFirstOfYear
    ? (last.benchmark / benchmarkFirstOfYear.benchmark - 1) * 100
    : 0;

  const cumulativePct = (last.portfolio / sorted[0].portfolio - 1) * 100;
  const alphaYtdPct = ytdPct - benchmarkYtdPct;

  // ─── Monthly returns ────────────────────────────────────
  // We approximate "monthly" as month-end NAV. With a daily series this
  // would need to bucket; with the existing monthly series, just diff.
  const monthlyReturns: number[] = [];
  const benchmarkMonthly: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    monthlyReturns.push(sorted[i].portfolio / sorted[i - 1].portfolio - 1);
    benchmarkMonthly.push(sorted[i].benchmark / sorted[i - 1].benchmark - 1);
  }

  const volAnnualizedPct = stdev(monthlyReturns) * Math.sqrt(12) * 100;

  // ─── Sharpe / Sortino / Calmar (rf = 0) ─────────────────────
  const meanMonthly = mean(monthlyReturns);
  const annualizedReturn = (Math.pow(1 + meanMonthly, 12) - 1) * 100;
  const sharpe = volAnnualizedPct > 0
    ? (annualizedReturn) / volAnnualizedPct
    : 0;

  const downsideStdev = stdev(monthlyReturns.filter((r) => r < 0));
  const sortino = downsideStdev > 0
    ? annualizedReturn / (downsideStdev * Math.sqrt(12) * 100)
    : 0;

  // ─── Drawdowns ───────────────────────────────────────────
  let peak = -Infinity;
  let maxDD = 0;
  for (const p of sorted) {
    peak = Math.max(peak, p.portfolio);
    const dd = (p.portfolio / peak - 1) * 100;
    if (dd < maxDD) maxDD = dd;
  }
  const maxDrawdownPct = maxDD;
  const peakAllTime = sorted.reduce(
    (a, p) => (p.portfolio > a ? p.portfolio : a),
    -Infinity,
  );
  const currentDrawdownPct = (last.portfolio / peakAllTime - 1) * 100;
  const calmar = maxDrawdownPct < 0 ? annualizedReturn / Math.abs(maxDrawdownPct) : 0;

  // ─── Beta + tracking error + information ratio ──────────────
  const covar = covariance(monthlyReturns, benchmarkMonthly);
  const varB = variance(benchmarkMonthly);
  const beta = varB > 0 ? covar / varB : 0;

  const excess = monthlyReturns.map((r, i) => r - benchmarkMonthly[i]);
  const trackingErrorPct = stdev(excess) * Math.sqrt(12) * 100;
  const informationRatio = trackingErrorPct > 0
    ? (mean(excess) * 12 * 100) / trackingErrorPct
    : 0;

  // ─── Concentration ─────────────────────────────────────
  const totalAbsWeight = positions.reduce((a, p) => a + Math.abs(p.weight), 0);
  const herfindahl = positions.reduce(
    (a, p) => a + Math.pow(Math.abs(p.weight) / 100, 2),
    0,
  );

  return {
    navCurrent,
    navInception,
    inceptionDate,
    dailyReturnPct: round(dailyReturnPct),
    mtdPct: round(mtdPct),
    ytdPct: round(ytdPct),
    cumulativePct: round(cumulativePct),
    benchmarkYtdPct: round(benchmarkYtdPct),
    alphaYtdPct: round(alphaYtdPct),
    volAnnualizedPct: round(volAnnualizedPct),
    sharpe: round(sharpe),
    sortino: round(sortino),
    calmar: round(calmar),
    maxDrawdownPct: round(maxDrawdownPct),
    currentDrawdownPct: round(currentDrawdownPct),
    beta: round(beta),
    trackingErrorPct: round(trackingErrorPct),
    informationRatio: round(informationRatio),
    cashPct: round(Math.max(0, Math.min(100, cashPct))),
    herfindahl: round(herfindahl, 3),
    // Used internally for sanity but not part of PortfolioKPIs type:
    // (totalAbsWeight available if a debug field is later added)
  } satisfies PortfolioKPIs & Record<string, number | string>;
  void totalAbsWeight;
}

// ─── stats helpers ─────────────────────────────────────────

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function variance(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
}

function stdev(xs: number[]): number {
  return Math.sqrt(variance(xs));
}

function covariance(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return 0;
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let s = 0;
  for (let i = 0; i < n; i++) s += (xs[i] - mx) * (ys[i] - my);
  return s / (n - 1);
}

function round(x: number, digits = 2): number {
  if (!Number.isFinite(x)) return 0;
  const p = Math.pow(10, digits);
  return Math.round(x * p) / p;
}
