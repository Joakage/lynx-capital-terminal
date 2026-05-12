import type { MarketDataProvider, Quote, QuoteError, QuoteResult } from "./provider";
import { toProviderSymbol, fromProviderSymbol } from "./symbol-map";

/**
 * Financial Modeling Prep (financialmodelingprep.com) — requires
 * FMP_API_KEY. Free tier supports 250 calls/day, enough for a
 * personal portfolio refresh once per market open.
 *
 * Endpoint shape:
 *   GET /api/v3/quote/AAPL,MSFT?apikey=...
 */
export class FmpProvider implements MarketDataProvider {
  readonly id = "fmp";

  constructor(private readonly apiKey: string) {}

  async getQuotes(tickers: string[]): Promise<QuoteResult> {
    if (tickers.length === 0) return { quotes: [], errors: [] };

    const providerSymbols = tickers.map((t) => toProviderSymbol(t, "fmp"));
    const url =
      `https://financialmodelingprep.com/api/v3/quote/${providerSymbols.join(",")}` +
      `?apikey=${encodeURIComponent(this.apiKey)}`;

    let payload: unknown;
    try {
      const resp = await fetch(url, { cache: "no-store" });
      if (!resp.ok) {
        const text = await resp.text();
        return {
          quotes: [],
          errors: tickers.map((ticker) => ({
            ticker,
            error: `FMP HTTP ${resp.status}: ${text.slice(0, 120)}`,
          })),
        };
      }
      payload = await resp.json();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        quotes: [],
        errors: tickers.map((ticker) => ({ ticker, error: `FMP fetch failed: ${msg}` })),
      };
    }

    if (!Array.isArray(payload)) {
      return {
        quotes: [],
        errors: tickers.map((ticker) => ({ ticker, error: "FMP devolvió payload inesperado" })),
      };
    }

    const quotes: Quote[] = [];
    for (const r of payload) {
      if (!r || typeof r !== "object") continue;
      const item = r as Record<string, unknown>;
      const symbol = String(item.symbol ?? "");
      const ticker = fromProviderSymbol(symbol, "fmp");
      const price = typeof item.price === "number" ? item.price : null;
      if (price === null || !Number.isFinite(price)) continue;
      quotes.push({
        ticker,
        price,
        change: typeof item.change === "number" ? item.change : undefined,
        changePct: typeof item.changesPercentage === "number" ? item.changesPercentage : undefined,
        timestamp: typeof item.timestamp === "number"
          ? new Date(item.timestamp * 1000).toISOString()
          : new Date().toISOString(),
      });
    }

    const errors: QuoteError[] = [];
    const got = new Set(quotes.map((q) => q.ticker));
    for (const ticker of tickers) {
      if (!got.has(ticker)) errors.push({ ticker, error: "FMP no devolvió cotización" });
    }

    return { quotes, errors };
  }
}
