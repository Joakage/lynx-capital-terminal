import type { NewsProvider, NewsFetchResult, RawNewsItem } from "./provider";
import { toProviderSymbol } from "@/lib/market/symbol-map";

/**
 * Yahoo Finance news. Uses `yahoo-finance2`'s `search()` endpoint
 * which returns up to ~10 articles per ticker. No API key, but Yahoo
 * may throttle aggressive use.
 */
export class YahooNewsProvider implements NewsProvider {
  readonly id = "yahoo";

  async getNews(tickers: string[], lookbackDays: number): Promise<NewsFetchResult> {
    if (tickers.length === 0) return { items: [], errors: [] };

    // yahoo-finance2 default export is typed as a class but at runtime it's a
    // ready-to-use singleton instance.
    type YahooLike = {
      suppressNotices?: (notices: string[]) => void;
      search: (
        query: string,
        opts: { newsCount?: number; quotesCount?: number },
      ) => Promise<{ news?: unknown[] } | undefined>;
    };
    let yf: YahooLike | null = null;
    try {
      const mod = await import("yahoo-finance2");
      yf = mod.default as unknown as YahooLike;
      yf.suppressNotices?.(["yahooSurvey"]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        items: [],
        errors: tickers.map((ticker) => ({ ticker, error: `yahoo-finance2 no instalado: ${msg}` })),
      };
    }

    const items: RawNewsItem[] = [];
    const errors: NewsFetchResult["errors"] = [];
    const cutoff = Date.now() - lookbackDays * 24 * 3600 * 1000;

    await Promise.all(
      tickers.map(async (ticker) => {
        const yahooSymbol = toProviderSymbol(ticker, "yahoo");
        try {
          // newsCount can be up to ~10. quotesCount=0 so the response is news-only.
          const res = await yf!.search(yahooSymbol, { newsCount: 10, quotesCount: 0 });
          const news = (res?.news ?? []) as Array<{
            uuid?: string;
            title?: string;
            publisher?: string;
            link?: string;
            providerPublishTime?: number | string | Date;
            type?: string;
            relatedTickers?: string[];
          }>;
          for (const n of news) {
            const ts = n.providerPublishTime;
            const epochMs = ts instanceof Date
              ? ts.getTime()
              : typeof ts === "number"
                ? ts * 1000
                : typeof ts === "string"
                  ? new Date(ts).getTime()
                  : Date.now();
            if (!Number.isFinite(epochMs) || epochMs < cutoff) continue;
            const externalId = String(n.uuid ?? `${ticker}-${epochMs}-${(n.title ?? "").slice(0, 24)}`);
            items.push({
              externalId,
              ticker,
              date: new Date(epochMs).toISOString(),
              title: n.title ?? "(sin título)",
              source: n.publisher ?? "Yahoo Finance",
              url: n.link,
              summary: n.title ?? "",
            });
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push({ ticker, error: `Yahoo news fetch failed: ${msg}` });
        }
      }),
    );

    return { items, errors };
  }
}
