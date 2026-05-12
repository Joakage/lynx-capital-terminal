/**
 * IBKR Flex Query client.
 *
 * The user configures a Flex Query in Account Management
 * (Settings → Account Settings → Flex Web Service / Flex Query).
 * They get:
 *   - IBKR_FLEX_TOKEN      a long-lived secret string
 *   - IBKR_FLEX_QUERY_ID   numeric id of the configured query
 *
 * Two-step protocol:
 *   1) POST /FlexStatementService.SendRequest → returns a ReferenceCode
 *   2) Poll /FlexStatementService.GetStatement with the ReferenceCode
 *      until the report is ready (~5-30s typically).
 *
 * Reference: https://www.interactivebrokers.com/campus/ibkr-api-page/flex-queries/
 */

import { XMLParser } from "fast-xml-parser";

const BASE = "https://gdcdyn.interactivebrokers.com/Universal/servlet";
const VERSION = 3;

export interface IbkrFlexConfig {
  token: string;
  queryId: string;
  /** Max poll attempts (default 12 ≈ 60s). */
  maxPolls?: number;
  /** Delay between polls in ms (default 5000). */
  pollDelayMs?: number;
}

/** Raw IBKR Trade element after XML parse (camelCased subset we use). */
export interface IbkrRawTrade {
  tradeID?: string;
  transactionID?: string;
  tradeDate?: string; // yyyymmdd
  dateTime?: string;
  symbol?: string;
  description?: string;
  conid?: string;
  currency?: string;
  assetCategory?: string; // STK | ETF | OPT | BOND | CASH | FUND
  buySell?: string;       // BUY | SELL
  quantity?: number | string;
  tradePrice?: number | string;
  proceeds?: number | string;
  ibCommission?: number | string;
  ibCommissionCurrency?: string;
  netCash?: number | string;
}

export class IbkrFlexClient {
  private readonly token: string;
  private readonly queryId: string;
  private readonly maxPolls: number;
  private readonly pollDelayMs: number;

  constructor(cfg: IbkrFlexConfig) {
    this.token = cfg.token;
    this.queryId = cfg.queryId;
    this.maxPolls = cfg.maxPolls ?? 12;
    this.pollDelayMs = cfg.pollDelayMs ?? 5000;
  }

  /** Run the full SendRequest → poll → GetStatement flow and return parsed trades. */
  async fetchTrades(): Promise<IbkrRawTrade[]> {
    const referenceCode = await this.sendRequest();
    const xml = await this.pollUntilReady(referenceCode);
    return parseFlexTrades(xml);
  }

  private async sendRequest(): Promise<string> {
    const url =
      `${BASE}/FlexStatementService.SendRequest` +
      `?t=${encodeURIComponent(this.token)}` +
      `&q=${encodeURIComponent(this.queryId)}` +
      `&v=${VERSION}`;
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) {
      throw new Error(`IBKR SendRequest HTTP ${resp.status}`);
    }
    const xml = await resp.text();
    const status = matchTag(xml, "Status");
    if (status !== "Success") {
      const message = matchTag(xml, "ErrorMessage") ?? "Unknown IBKR error";
      throw new Error(`IBKR SendRequest failed: ${message}`);
    }
    const ref = matchTag(xml, "ReferenceCode");
    if (!ref) throw new Error("IBKR SendRequest: no ReferenceCode in response");
    return ref;
  }

  private async pollUntilReady(referenceCode: string): Promise<string> {
    const url =
      `${BASE}/FlexStatementService.GetStatement` +
      `?t=${encodeURIComponent(this.token)}` +
      `&q=${encodeURIComponent(referenceCode)}` +
      `&v=${VERSION}`;

    let lastError = "";
    for (let i = 0; i < this.maxPolls; i++) {
      // Wait before the first poll too — the report is never ready instantly.
      await sleep(this.pollDelayMs);
      const resp = await fetch(url, { cache: "no-store" });
      if (!resp.ok) {
        lastError = `IBKR GetStatement HTTP ${resp.status}`;
        continue;
      }
      const body = await resp.text();
      // While the report is queued IBKR returns a status XML with "ReportNotAvailable"
      // or similar. The final response is a <FlexQueryResponse> document.
      if (body.includes("<FlexQueryResponse")) {
        return body;
      }
      const status = matchTag(body, "Status");
      const message = matchTag(body, "ErrorMessage");
      lastError = `IBKR not ready: status=${status ?? "?"} ${message ?? ""}`.trim();
    }
    throw new Error(
      `IBKR Flex Query no estuvo lista tras ${this.maxPolls} intentos (${this.maxPolls * this.pollDelayMs / 1000}s). Último estado: ${lastError}`,
    );
  }
}

const TAG_RE_CACHE: Record<string, RegExp> = {};
function matchTag(xml: string, tag: string): string | null {
  const re = TAG_RE_CACHE[tag] ??= new RegExp(`<${tag}>([^<]*)</${tag}>`);
  const m = re.exec(xml);
  return m ? m[1].trim() : null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract <Trade ... /> attributes from a FlexQueryResponse XML payload.
 * The XML can be deeply nested (FlexQueryResponse → FlexStatements →
 * FlexStatement → Trades → Trade); we use fast-xml-parser with attributes
 * preserved and walk the tree defensively.
 */
export function parseFlexTrades(xml: string): IbkrRawTrade[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    allowBooleanAttributes: true,
    parseAttributeValue: true,
    isArray: (tagName) => tagName === "Trade" || tagName === "FlexStatement",
  });

  let doc: unknown;
  try {
    doc = parser.parse(xml);
  } catch (err) {
    throw new Error(
      `Error parseando XML de IBKR Flex: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const trades: IbkrRawTrade[] = [];
  walkTrades(doc, trades);
  return trades;
}

function walkTrades(node: unknown, out: IbkrRawTrade[]): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const child of node) walkTrades(child, out);
    return;
  }
  const o = node as Record<string, unknown>;
  if (Array.isArray(o.Trade)) {
    for (const t of o.Trade) {
      if (t && typeof t === "object") out.push(t as IbkrRawTrade);
    }
  }
  for (const value of Object.values(o)) {
    if (value && typeof value === "object") walkTrades(value, out);
  }
}
