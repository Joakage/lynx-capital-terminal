import type { EarningsCalendarProvider } from "./earnings-provider";
import { YahooEarningsProvider } from "./earnings-yahoo";
import { FmpEarningsProvider } from "./earnings-fmp";

/**
 * Pick an earnings calendar provider:
 *   EARNINGS_PROVIDER=yahoo (default) | fmp
 *   FMP_API_KEY=...                    (required for fmp)
 *
 * Falls back to MARKET_DATA_PROVIDER if unset, like the news provider.
 */
export function getEarningsProvider(): EarningsCalendarProvider {
  const choice = (
    process.env.EARNINGS_PROVIDER ?? process.env.MARKET_DATA_PROVIDER ?? "yahoo"
  ).toLowerCase();

  switch (choice) {
    case "fmp": {
      const key = process.env.FMP_API_KEY;
      if (!key) {
        throw new Error(
          "EARNINGS_PROVIDER=fmp pero falta FMP_API_KEY. Define la key o cambia a EARNINGS_PROVIDER=yahoo.",
        );
      }
      return new FmpEarningsProvider(key);
    }
    case "yahoo":
    default:
      return new YahooEarningsProvider();
  }
}
