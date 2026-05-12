import type { NewsProvider } from "./provider";
import { YahooNewsProvider } from "./yahoo";
import { FmpNewsProvider } from "./fmp";

/**
 * Pick a news provider:
 *   NEWS_PROVIDER=yahoo (default) | fmp
 *   FMP_API_KEY=...   (required when NEWS_PROVIDER=fmp)
 *
 * Falls back to MARKET_DATA_PROVIDER if NEWS_PROVIDER is unset so a
 * single config knob can drive both quotes and news for FMP users.
 */
export function getNewsProvider(): NewsProvider {
  const choice = (
    process.env.NEWS_PROVIDER ?? process.env.MARKET_DATA_PROVIDER ?? "yahoo"
  ).toLowerCase();

  switch (choice) {
    case "fmp": {
      const key = process.env.FMP_API_KEY;
      if (!key) {
        throw new Error(
          "NEWS_PROVIDER=fmp pero falta FMP_API_KEY. Define la key o cambia a NEWS_PROVIDER=yahoo.",
        );
      }
      return new FmpNewsProvider(key);
    }
    case "yahoo":
    default:
      return new YahooNewsProvider();
  }
}
