import type { MarketDataProvider, Quote, QuoteError, QuoteResult } from "./provider";
import { toProviderSymbol, fromProviderSymbol } from "./symbol-map";

/**
 * Yahoo Finance provider. Uses the `yahoo-finance2` library, which
 * handles the cookie / crumb dance. No API key required — but Yahoo
 * is a free public endpoint and may rate-limit aggressive use.
 *
 * Dependency loaded dynamically so the rest of the app builds even
 * when the package isn't installed (e.g. CI without `npm install`).
 */
export class YahooProvider implements MarketDataProvider {
  readonly id = "yahoo";

  async getQuotes(tickers: string[]): Promise<QuoteResult> {
    if (tickers.length === 0) return { quotes: [], errors: [] };

    // yahoo-finance2 default export is typed as a class but at runtime it's a
    // ready-to-use singleton instance. Cast through `unknown` to a minimal
    // surface so we don't fight the types.
    type YahooLike = {
      suppressNotices?: (notices: string[]) => void;
      quote: (symbols: string | string[]) => Promise<unknown>;
    };
    let yf: YahooLike | null = null;
    try {
      const mod = await import("yahoo-finance2");
      yf = mod.default as unknown as YahooLike;
      yf.suppressNotices?.(["yahooSurvey"]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        quotes: [],
        errors: tickers.map((ticker) => ({
          ticker,
          error: `yahoo-finance2 no instalado: ${msg}`,
        })),
      };
    }

    const providerSymbols = tickers.map((t) => toProviderSymbol(t, "yahoo"));
    const quotes: Quote[] = [];
    const errors: QuoteError[] = [];

    try {
      const results = await yf.quote(providerSymbols);
      const list = Array.isArray(results) ? results : [results];
      for (const r of list) {
        if (!r || typeof r !== "object") continue;
        const symbol = String((r as { symbol?: string }).symbol ?? "");
        const ticker = fromProviderSymbol(symbol, "yahoo");
        const price =
          (r as { regularMarketPrice?: number }).regularMarketPrice ??
          (r as { ask?: number }).ask ??
          (r as { bid?: number }).bid;
        if (typeof price !== "number" || !Number.isFinite(price)) {
          errors.push({ ticker, error: "Sin precio en la respuesta Yahoo" });
          continue;
        }
        quotes.push({
          ticker,
          price,
          previousClose: (r as { regularMarketPreviousClose?: number }).regularMarketPreviousClose,
          change: (r as { regularMarketChange?: number }).regularMarketChange,
          changePct: (r as { regularMarketChangePercent?: number }).regularMarketChangePercent,
          timestamp: new Date().toISOString(),
          currency: (r as { currency?: string }).currency,
        });
      }
      // Tickers we asked for but didn't get back
      const got = new Set(quotes.map((q) => q.ticker));
      for (const ticker of tickers) {
        if (!got.has(ticker) && !errors.find((e) => e.ticker === ticker)) {
          errors.push({ ticker, error: "Yahoo no devolvió cotización" });
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      for (const ticker of tickers) {
        if (!quotes.find((q) => q.ticker === ticker)) {
          errors.push({ ticker, error: `Yahoo fetch failed: ${msg}` });
        }
      }
    }

    return { quotes, errors };
  }
}
