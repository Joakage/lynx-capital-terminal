import type {
  EarningsCalendarProvider,
  EarningsCalendarFetchResult,
  UpcomingEarnings,
} from "./earnings-provider";
import { toProviderSymbol } from "./symbol-map";

/**
 * Yahoo earnings calendar: `quoteSummary(symbol, { modules: ['calendarEvents'] })`
 * returns `earnings.earningsDate[]` and optionally EPS estimates.
 * One call per ticker (Yahoo doesn't support batch on this module).
 */
export class YahooEarningsProvider implements EarningsCalendarProvider {
  readonly id = "yahoo";

  async getUpcoming(tickers: string[], lookaheadDays: number): Promise<EarningsCalendarFetchResult> {
    if (tickers.length === 0) return { items: [], errors: [] };

    let yf: typeof import("yahoo-finance2").default | null = null;
    try {
      const mod = await import("yahoo-finance2");
      yf = mod.default;
      // @ts-expect-error — runtime helper
      yf?.suppressNotices?.(["yahooSurvey"]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        items: [],
        errors: tickers.map((ticker) => ({ ticker, error: `yahoo-finance2 no instalado: ${msg}` })),
      };
    }

    const items: UpcomingEarnings[] = [];
    const errors: EarningsCalendarFetchResult["errors"] = [];
    const now = Date.now();
    const cutoff = now + lookaheadDays * 24 * 3600 * 1000;

    await Promise.all(
      tickers.map(async (ticker) => {
        const yahooSymbol = toProviderSymbol(ticker, "yahoo");
        try {
          const res = await yf!.quoteSummary(yahooSymbol, { modules: ["calendarEvents", "earnings"] });
          const cal = (res as { calendarEvents?: unknown }).calendarEvents as
            | { earnings?: { earningsDate?: (Date | string)[]; earningsAverage?: number; revenueAverage?: number } }
            | undefined;
          const dateValues = cal?.earnings?.earningsDate ?? [];
          if (dateValues.length === 0) return;

          // yahoo-finance2 may return ranges (lo,hi) — take the earliest in-range
          const epochs = dateValues
            .map((d) => (d instanceof Date ? d.getTime() : new Date(d as string).getTime()))
            .filter((ms) => Number.isFinite(ms) && ms >= now && ms <= cutoff)
            .sort((a, b) => a - b);
          if (epochs.length === 0) return;

          const earnings = (res as { earnings?: { earningsDate?: { fmt?: string }[] } }).earnings;
          items.push({
            ticker,
            date: new Date(epochs[0]).toISOString().slice(0, 10),
            period: earnings?.earningsDate?.[0]?.fmt,
            epsEstimate: cal?.earnings?.earningsAverage,
            revenueEstimate: cal?.earnings?.revenueAverage,
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push({ ticker, error: `Yahoo earnings fetch failed: ${msg}` });
        }
      }),
    );

    return { items, errors };
  }
}
