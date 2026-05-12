import type {
  EarningsCalendarProvider,
  EarningsCalendarFetchResult,
  UpcomingEarnings,
} from "./earnings-provider";
import { toProviderSymbol } from "./symbol-map";

/**
 * Financial Modeling Prep earnings calendar.
 *   GET /api/v3/earning_calendar?from=YYYY-MM-DD&to=YYYY-MM-DD&apikey=...
 * Returns all earnings in the range; we filter by ticker.
 *
 * The per-ticker endpoint `/api/v3/historical/earning_calendar/{symbol}`
 * also exists but returns history; we want forward-looking dates.
 */
export class FmpEarningsProvider implements EarningsCalendarProvider {
  readonly id = "fmp";

  constructor(private readonly apiKey: string) {}

  async getUpcoming(tickers: string[], lookaheadDays: number): Promise<EarningsCalendarFetchResult> {
    if (tickers.length === 0) return { items: [], errors: [] };

    const today = new Date();
    const future = new Date(today.getTime() + lookaheadDays * 24 * 3600 * 1000);
    const from = today.toISOString().slice(0, 10);
    const to = future.toISOString().slice(0, 10);

    const url =
      `https://financialmodelingprep.com/api/v3/earning_calendar` +
      `?from=${from}&to=${to}&apikey=${encodeURIComponent(this.apiKey)}`;

    let payload: unknown;
    try {
      const resp = await fetch(url, { cache: "no-store" });
      if (!resp.ok) {
        const text = await resp.text();
        return {
          items: [],
          errors: [{ ticker: "*", error: `FMP earning_calendar HTTP ${resp.status}: ${text.slice(0, 120)}` }],
        };
      }
      payload = await resp.json();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { items: [], errors: [{ ticker: "*", error: `FMP fetch failed: ${msg}` }] };
    }

    if (!Array.isArray(payload)) {
      return { items: [], errors: [{ ticker: "*", error: "FMP devolvió payload inesperado" }] };
    }

    const wantedSymbols = new Set(tickers.map((t) => toProviderSymbol(t, "fmp")));
    const items: UpcomingEarnings[] = [];

    for (const r of payload as Array<Record<string, unknown>>) {
      const symbol = String(r.symbol ?? "");
      if (!wantedSymbols.has(symbol)) continue;
      const canonical = tickers.find((t) => toProviderSymbol(t, "fmp") === symbol) ?? symbol;
      const date = typeof r.date === "string" ? r.date : null;
      if (!date) continue;
      items.push({
        ticker: canonical,
        date,
        period: typeof r.fiscalDateEnding === "string" ? r.fiscalDateEnding : undefined,
        epsEstimate: typeof r.epsEstimated === "number" ? r.epsEstimated : undefined,
        revenueEstimate: typeof r.revenueEstimated === "number" ? r.revenueEstimated : undefined,
      });
    }

    return { items, errors: [] };
  }
}
