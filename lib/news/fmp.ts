import type { NewsProvider, NewsFetchResult, RawNewsItem } from "./provider";
import { toProviderSymbol } from "@/lib/market/symbol-map";

/**
 * Financial Modeling Prep news. Provides a richer `text` field
 * (article snippet) than Yahoo, which gives Claude more context to
 * classify. Requires FMP_API_KEY.
 *
 *   GET /api/v3/stock_news?tickers=AAPL,MSFT&limit=20&apikey=...
 */
export class FmpNewsProvider implements NewsProvider {
  readonly id = "fmp";

  constructor(private readonly apiKey: string) {}

  async getNews(tickers: string[], lookbackDays: number): Promise<NewsFetchResult> {
    if (tickers.length === 0) return { items: [], errors: [] };

    const providerSymbols = tickers.map((t) => toProviderSymbol(t, "fmp")).join(",");
    const limit = Math.min(50, tickers.length * 5);
    const url =
      `https://financialmodelingprep.com/api/v3/stock_news` +
      `?tickers=${encodeURIComponent(providerSymbols)}` +
      `&limit=${limit}` +
      `&apikey=${encodeURIComponent(this.apiKey)}`;

    let payload: unknown;
    try {
      const resp = await fetch(url, { cache: "no-store" });
      if (!resp.ok) {
        const text = await resp.text();
        return {
          items: [],
          errors: tickers.map((ticker) => ({
            ticker,
            error: `FMP news HTTP ${resp.status}: ${text.slice(0, 120)}`,
          })),
        };
      }
      payload = await resp.json();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        items: [],
        errors: tickers.map((ticker) => ({ ticker, error: `FMP news fetch failed: ${msg}` })),
      };
    }

    if (!Array.isArray(payload)) {
      return { items: [], errors: [{ ticker: "*", error: "FMP devolvió payload inesperado" }] };
    }

    const cutoff = Date.now() - lookbackDays * 24 * 3600 * 1000;
    const items: RawNewsItem[] = [];

    for (const r of payload as Array<Record<string, unknown>>) {
      const symbol = String(r.symbol ?? "");
      // FMP returns the symbol as we asked it; map back to canonical via reverse lookup
      const canonical =
        tickers.find((t) => toProviderSymbol(t, "fmp") === symbol) ?? symbol;
      const publishedDate = typeof r.publishedDate === "string" ? r.publishedDate : null;
      if (!publishedDate) continue;
      const epochMs = new Date(publishedDate).getTime();
      if (!Number.isFinite(epochMs) || epochMs < cutoff) continue;
      const url = typeof r.url === "string" ? r.url : undefined;
      const externalId = url ?? `${canonical}-${epochMs}-${String(r.title ?? "").slice(0, 24)}`;
      items.push({
        externalId,
        ticker: canonical,
        date: new Date(epochMs).toISOString(),
        title: String(r.title ?? "(sin título)"),
        source: String(r.site ?? "FMP"),
        url,
        summary: typeof r.text === "string" && r.text.length > 0 ? r.text : String(r.title ?? ""),
      });
    }

    return { items, errors: [] };
  }
}
