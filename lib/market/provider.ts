/**
 * Market data provider abstraction. Each implementation (Yahoo, FMP,
 * EODHD, …) returns the same shape so the refresh orchestrator stays
 * provider-agnostic. Tickers are passed in CANONICAL form (the same
 * `Company.ticker` we store in the DB); the implementation translates
 * to its provider-specific symbol via `lib/market/symbol-map.ts`.
 */

export interface Quote {
  /** Canonical ticker (as stored in DB). */
  ticker: string;
  /** Last traded price in the security's native currency. */
  price: number;
  /** Absolute change vs previous close, in native currency. */
  change?: number;
  /** Percent change vs previous close. */
  changePct?: number;
  /** ISO 8601 timestamp of the price. */
  timestamp?: string;
  /** Native currency of the price (USD, EUR, ...). */
  currency?: string;
}

export interface QuoteError {
  ticker: string;
  error: string;
}

export interface QuoteResult {
  quotes: Quote[];
  errors: QuoteError[];
}

export interface MarketDataProvider {
  /** Human-readable id (yahoo | fmp | eodhd | ...). Surfaced in API responses. */
  readonly id: string;
  /** Fetch latest quotes for the given canonical tickers. */
  getQuotes(tickers: string[]): Promise<QuoteResult>;
}
