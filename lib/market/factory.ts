import type { MarketDataProvider } from "./provider";
import { YahooProvider } from "./yahoo";
import { FmpProvider } from "./fmp";

/**
 * Pick a market data provider based on env:
 *   MARKET_DATA_PROVIDER=yahoo | fmp   (default: yahoo)
 *   FMP_API_KEY=...                    (required for fmp)
 *
 * Throws if the chosen provider is unconfigured — the caller surfaces
 * the error to the user via the refresh API response.
 */
export function getMarketProvider(): MarketDataProvider {
  const choice = (process.env.MARKET_DATA_PROVIDER ?? "yahoo").toLowerCase();

  switch (choice) {
    case "fmp": {
      const key = process.env.FMP_API_KEY;
      if (!key) {
        throw new Error(
          "MARKET_DATA_PROVIDER=fmp pero falta FMP_API_KEY en el entorno.",
        );
      }
      return new FmpProvider(key);
    }
    case "yahoo":
    default:
      return new YahooProvider();
  }
}
