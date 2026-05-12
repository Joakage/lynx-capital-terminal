/**
 * Earnings calendar provider: returns upcoming earnings dates for a
 * list of tickers. Used by `lib/market/refresh-earnings.ts` to upsert
 * rows into the `CalendarEvent` table.
 */

export interface UpcomingEarnings {
  ticker: string;
  /** ISO 8601 date (yyyy-MM-dd). */
  date: string;
  /** Optional reporting period label ("Q1 FY26", "FY25", …). */
  period?: string;
  /** Optional EPS / revenue estimates (if the provider returns them). */
  epsEstimate?: number;
  revenueEstimate?: number;
}

export interface EarningsCalendarFetchResult {
  items: UpcomingEarnings[];
  errors: Array<{ ticker: string; error: string }>;
}

export interface EarningsCalendarProvider {
  readonly id: string;
  getUpcoming(tickers: string[], lookaheadDays: number): Promise<EarningsCalendarFetchResult>;
}
