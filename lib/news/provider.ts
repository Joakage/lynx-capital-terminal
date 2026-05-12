/**
 * News provider abstraction. Returns unclassified raw news items;
 * sentiment + thesisImpact are added later by `lib/news/classify.ts`.
 */

export interface RawNewsItem {
  /** Stable provider-side identifier. We prefix it with provider id when persisting. */
  externalId: string;
  ticker: string;
  /** ISO 8601. */
  date: string;
  title: string;
  source: string;
  url?: string;
  /** Best-effort article summary. Yahoo only gives the title; FMP gives a snippet. */
  summary: string;
}

export interface NewsFetchResult {
  items: RawNewsItem[];
  errors: Array<{ ticker: string; error: string }>;
}

export interface NewsProvider {
  readonly id: string;
  /**
   * Fetch news for the given canonical tickers. Implementations should
   * limit results to the last `lookbackDays` and de-dup repeats.
   */
  getNews(tickers: string[], lookbackDays: number): Promise<NewsFetchResult>;
}
