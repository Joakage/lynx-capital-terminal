import type { Position } from "@/lib/types";
import { getKpis, getPositions } from "./portfolio";
import { getCompanies } from "./companies";

interface ExposureBreakdowns {
  sector: Array<{ sector: string; weight: number }>;
  region: Array<{ region: string; weight: number }>;
  marketCap: Array<{ bucket: string; weight: number }>;
  currency: Array<{ currency: string; weight: number }>;
  style: Array<{ style: string; weight: number }>;
}

export async function getExposures(): Promise<ExposureBreakdowns> {
  const [positions, companies, kpis] = await Promise.all([
    getPositions(),
    getCompanies(),
    getKpis(),
  ]);
  const byTicker = new Map(companies.map((c) => [c.ticker, c]));

  const sector = new Map<string, number>();
  const region = new Map<string, number>();
  const marketCap = new Map<string, number>();
  const currency = new Map<string, number>();
  const style = new Map<string, number>();

  for (const p of positions) {
    const c = byTicker.get(p.ticker);
    if (!c) continue;
    sector.set(c.sector, (sector.get(c.sector) ?? 0) + p.weight);
    region.set(c.region, (region.get(c.region) ?? 0) + p.weight);
    marketCap.set(c.marketCapBucket, (marketCap.get(c.marketCapBucket) ?? 0) + p.weight);
    currency.set(c.currency, (currency.get(c.currency) ?? 0) + p.weight);
    style.set(c.style, (style.get(c.style) ?? 0) + p.weight);
  }
  region.set("Cash", kpis.cashPct);
  marketCap.set("Cash", kpis.cashPct);

  const sort = <T extends { weight: number }>(arr: T[]) =>
    arr.sort((a, b) => b.weight - a.weight);

  return {
    sector: sort(Array.from(sector.entries()).map(([sector, w]) => ({ sector, weight: +w.toFixed(2) }))),
    region: sort(Array.from(region.entries()).map(([region, w]) => ({ region, weight: +w.toFixed(2) }))),
    marketCap: Array.from(marketCap.entries()).map(([bucket, w]) => ({ bucket, weight: +w.toFixed(2) })),
    currency: Array.from(currency.entries()).map(([currency, w]) => ({ currency, weight: +w.toFixed(2) })),
    style: sort(Array.from(style.entries()).map(([style, w]) => ({ style, weight: +w.toFixed(2) }))),
  };
}

interface Contributor {
  ticker: string;
  name: string;
  contribPct: number;
  returnPct: number;
}

export async function getTopContributors(n = 5): Promise<Contributor[]> {
  const [positions, companies] = await Promise.all([getPositions(), getCompanies()]);
  const byTicker = new Map(companies.map((c) => [c.ticker, c]));
  return [...positions]
    .sort((a, b) => b.unrealizedPnlPct * b.weight - a.unrealizedPnlPct * a.weight)
    .slice(0, n)
    .map((p: Position) => ({
      ticker: p.ticker,
      name: byTicker.get(p.ticker)?.name ?? p.ticker,
      contribPct: +((p.unrealizedPnlPct * p.weight) / 100).toFixed(2),
      returnPct: p.unrealizedPnlPct,
    }));
}

export async function getTopDetractors(n = 5): Promise<Contributor[]> {
  const [positions, companies] = await Promise.all([getPositions(), getCompanies()]);
  const byTicker = new Map(companies.map((c) => [c.ticker, c]));
  return [...positions]
    .sort((a, b) => a.unrealizedPnlPct * a.weight - b.unrealizedPnlPct * b.weight)
    .slice(0, n)
    .map((p: Position) => ({
      ticker: p.ticker,
      name: byTicker.get(p.ticker)?.name ?? p.ticker,
      contribPct: +((p.unrealizedPnlPct * p.weight) / 100).toFixed(2),
      returnPct: p.unrealizedPnlPct,
    }));
}
