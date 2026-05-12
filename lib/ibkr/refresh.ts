import { prisma, hasDatabase, getDefaultPortfolioId } from "@/lib/db";
import { IbkrFlexClient, type IbkrRawTrade } from "./flex";

export interface IbkrRefreshResult {
  ok: boolean;
  durationMs: number;
  asOf: string;
  fetched: number;
  inserted: number;
  skipped: number;
  errors: number;
  items: Array<{
    id: string;
    ticker: string;
    side?: string;
    quantity?: number;
    price?: number;
    date?: string;
    status: "inserted" | "skipped" | "error";
    error?: string;
  }>;
  message?: string;
}

/**
 * Pull trades from IBKR Flex Query and insert them into the
 * Transaction table. Idempotent via the IBKR tradeID — re-running
 * never duplicates a fill.
 *
 * Requires IBKR_FLEX_TOKEN + IBKR_FLEX_QUERY_ID.
 */
export async function refreshIbkrTransactions(): Promise<IbkrRefreshResult> {
  const startedAt = Date.now();
  const asOf = new Date().toISOString();

  if (!hasDatabase()) {
    return base(startedAt, asOf, {
      ok: false,
      message: "DATABASE_URL no configurado.",
    });
  }
  const token = process.env.IBKR_FLEX_TOKEN;
  const queryId = process.env.IBKR_FLEX_QUERY_ID;
  if (!token || !queryId) {
    return base(startedAt, asOf, {
      ok: false,
      message:
        "Faltan IBKR_FLEX_TOKEN o IBKR_FLEX_QUERY_ID. Genera la Flex Query en Account Management → Flex Web Service.",
    });
  }
  const portfolioId = await getDefaultPortfolioId();
  if (!portfolioId) {
    return base(startedAt, asOf, { ok: false, message: "No hay portfolio en la DB." });
  }

  let raw: IbkrRawTrade[];
  try {
    const client = new IbkrFlexClient({ token, queryId });
    raw = await client.fetchTrades();
  } catch (err) {
    return base(startedAt, asOf, {
      ok: false,
      message: err instanceof Error ? err.message : String(err),
    });
  }
  const fetched = raw.length;

  // Build the set of existing IBKR transaction IDs (we prefix with "ibkr-")
  // so we can detect previously-imported fills.
  const candidateIds = raw
    .map((t) => stableId(t))
    .filter((id): id is string => Boolean(id));
  const existing = candidateIds.length > 0
    ? await prisma.transaction.findMany({
        where: { id: { in: candidateIds } },
        select: { id: true },
      })
    : [];
  const existingIds = new Set(existing.map((e) => e.id));

  // Pre-create the companies referenced by these trades if they don't
  // exist yet (FK constraint on Transaction.ticker → Company.ticker).
  const newTickers = Array.from(
    new Set(
      raw
        .map((t) => normalizeTicker(t.symbol))
        .filter((t): t is string => Boolean(t)),
    ),
  );
  if (newTickers.length > 0) {
    const knownCompanies = await prisma.company.findMany({
      where: { ticker: { in: newTickers } },
      select: { ticker: true },
    });
    const known = new Set(knownCompanies.map((c) => c.ticker));
    for (const ticker of newTickers) {
      if (known.has(ticker)) continue;
      const description = raw.find((t) => normalizeTicker(t.symbol) === ticker)?.description;
      await prisma.company.create({
        data: {
          ticker,
          name: description ?? ticker,
          country: "—",
          region: "Otros",
          sector: "—",
          subsector: "—",
          currency: (raw.find((t) => normalizeTicker(t.symbol) === ticker)?.currency as string | undefined) ?? "USD",
          marketCapBucket: "Large Cap",
          marketCapUsdBn: 0,
          description: `Auto-creada desde IBKR Flex Query (${ticker}). Edita los campos en /companies/${encodeURIComponent(ticker)}.`,
          style: "Compounder",
        },
      });
    }
  }

  const items: IbkrRefreshResult["items"] = [];
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const t of raw) {
    const id = stableId(t);
    if (!id) {
      errors++;
      items.push({ id: "—", ticker: t.symbol ?? "?", status: "error", error: "Trade sin tradeID/transactionID" });
      continue;
    }
    if (existingIds.has(id)) {
      skipped++;
      items.push({
        id,
        ticker: normalizeTicker(t.symbol) ?? "?",
        status: "skipped",
        date: parseDate(t.tradeDate),
      });
      continue;
    }
    try {
      const ticker = normalizeTicker(t.symbol);
      if (!ticker) throw new Error("Trade sin symbol");
      const dateStr = parseDate(t.tradeDate);
      if (!dateStr) throw new Error(`tradeDate inválido: ${t.tradeDate}`);

      const quantity = Math.abs(toNumber(t.quantity));
      const price = toNumber(t.tradePrice);
      const fees = Math.abs(toNumber(t.ibCommission));
      const side = mapSide(t.buySell);
      const type = mapAssetCategory(t.assetCategory);

      await prisma.transaction.create({
        data: {
          id,
          portfolioId,
          date: new Date(dateStr),
          type,
          ticker,
          side,
          quantity,
          price,
          fees,
          currency: t.currency ?? "USD",
          rationale: "Importado desde IBKR Flex Query",
        },
      });
      inserted++;
      items.push({
        id,
        ticker,
        side,
        quantity,
        price,
        date: dateStr,
        status: "inserted",
      });
    } catch (err) {
      errors++;
      items.push({
        id,
        ticker: normalizeTicker(t.symbol) ?? "?",
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return {
    ok: true,
    durationMs: Date.now() - startedAt,
    asOf,
    fetched,
    inserted,
    skipped,
    errors,
    items,
  };
}

function base(
  startedAt: number,
  asOf: string,
  override: Partial<IbkrRefreshResult>,
): IbkrRefreshResult {
  return {
    ok: false,
    durationMs: Date.now() - startedAt,
    asOf,
    fetched: 0,
    inserted: 0,
    skipped: 0,
    errors: 0,
    items: [],
    ...override,
  };
}

function stableId(t: IbkrRawTrade): string | null {
  const raw = t.tradeID ?? t.transactionID;
  return raw ? `ibkr-${raw}` : null;
}

function normalizeTicker(symbol: string | undefined): string | null {
  if (!symbol) return null;
  // IBKR uses "BRK B" with a space for share classes; map to "BRK.B" to match our seed.
  return symbol.trim().replace(/\s+/g, ".");
}

function parseDate(yyyymmdd: string | undefined): string | null {
  if (!yyyymmdd) return null;
  const s = String(yyyymmdd);
  if (s.length === 8 && /^\d{8}$/.test(s)) {
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  }
  // Some IBKR exports use yyyy-MM-dd or yyyy-MM-dd;hh:mm:ss
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(s);
  return m ? m[1] : null;
}

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function mapSide(s: string | undefined): "Compra" | "Venta" | "Dividendo" | "Comisión" | "FX" {
  const up = String(s ?? "").toUpperCase();
  if (up.includes("BUY")) return "Compra";
  if (up.includes("SELL")) return "Venta";
  return "Compra"; // sensible default for unknown
}

function mapAssetCategory(
  s: string | undefined,
): "Equity" | "ETF" | "Bond" | "Option" | "Cash" {
  const up = String(s ?? "").toUpperCase();
  if (up === "STK" || up === "STOCK") return "Equity";
  if (up === "ETF" || up === "FUND") return "ETF";
  if (up === "BOND" || up === "BND") return "Bond";
  if (up === "OPT") return "Option";
  if (up === "CASH") return "Cash";
  return "Equity";
}
