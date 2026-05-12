/**
 * Per-provider symbol mapping. Our canonical tickers (the ones in
 * lib/mock-data.ts and the Company.ticker primary key) follow a mix
 * of conventions; each market data provider has its own format.
 *
 * Add new mappings here when adding a new position / new provider.
 */

type ProviderId = "yahoo" | "fmp";

const map: Record<ProviderId, Record<string, string>> = {
  yahoo: {
    "BRK.B": "BRK-B",
    "LVMH": "MC.PA",      // LVMH cotiza como MC en Paris
    "NEXI": "NEXI.MI",    // Nexi cotiza en Milán
    "ASML": "ASML",       // ASML lista en US y AMS, US suele bastar
    "7203.T": "7203.T",   // Toyota Japan
  },
  fmp: {
    "BRK.B": "BRK-B",
    "LVMH": "MC.PA",
    "NEXI": "NEXI.MI",
    "7203.T": "7203.T",
  },
};

/** Translate our canonical ticker to the provider-specific symbol. */
export function toProviderSymbol(ticker: string, provider: ProviderId): string {
  return map[provider][ticker] ?? ticker;
}

/** Inverse: provider symbol → canonical ticker (used when matching responses). */
export function fromProviderSymbol(symbol: string, provider: ProviderId): string {
  const m = map[provider];
  for (const [canonical, providerSym] of Object.entries(m)) {
    if (providerSym === symbol) return canonical;
  }
  return symbol;
}
