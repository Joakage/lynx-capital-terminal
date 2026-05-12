import { prisma, hasDatabase, getDefaultPortfolioId } from "@/lib/db";
import { getNewsProvider } from "./factory";
import { classifyNews, type NewsClassification } from "./classify";
import type { Company, Thesis } from "@/lib/types";

export interface NewsItemResult {
  ticker: string;
  externalId: string;
  status: "inserted" | "skipped" | "classify-error" | "fetch-error";
  title?: string;
  source?: string;
  sentiment?: NewsClassification["sentiment"];
  thesisImpact?: NewsClassification["thesisImpact"];
  category?: NewsClassification["category"];
  reasoning?: string;
  error?: string;
}

export interface RefreshNewsResult {
  ok: boolean;
  provider: string;
  model: string;
  durationMs: number;
  asOf: string;
  fetched: number;
  newCandidates: number;
  inserted: number;
  classifyErrors: number;
  items: NewsItemResult[];
  message?: string;
}

export interface RefreshNewsOptions {
  lookbackDays?: number;
  /** Cap on Claude calls per refresh to avoid surprise spend. */
  maxClassifications?: number;
}

/**
 * Fetch recent news for every position in the default portfolio,
 * classify each new article with Claude, and persist into the `News`
 * table. Idempotent: items already in DB (matched by stable id of
 * `${provider}-${externalId}`) are skipped, not reclassified.
 */
export async function refreshNews(opts: RefreshNewsOptions = {}): Promise<RefreshNewsResult> {
  const startedAt = Date.now();
  const asOf = new Date().toISOString();
  const lookbackDays = opts.lookbackDays ?? 7;
  const maxClassifications = opts.maxClassifications ?? 40;

  if (!hasDatabase()) {
    return base("—", "—", startedAt, asOf, {
      ok: false,
      message:
        "DATABASE_URL no configurado — refresh de noticias requiere Postgres (Fase 2B).",
    });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return base("—", "—", startedAt, asOf, {
      ok: false,
      message:
        "ANTHROPIC_API_KEY no configurado — la clasificación de noticias usa Claude.",
    });
  }

  const portfolioId = await getDefaultPortfolioId();
  if (!portfolioId) {
    return base("—", "—", startedAt, asOf, {
      ok: false,
      message: "No hay portfolio en la DB. Ejecuta `npm run db:seed`.",
    });
  }

  const positionRows = await prisma.position.findMany({
    where: { portfolioId },
    orderBy: { weight: "desc" },
  });
  const tickers = positionRows.map((p) => p.ticker);
  if (tickers.length === 0) {
    return base("—", "—", startedAt, asOf, {
      ok: false,
      message: "El portfolio no tiene posiciones.",
    });
  }

  let provider: ReturnType<typeof getNewsProvider>;
  try {
    provider = getNewsProvider();
  } catch (err) {
    return base("—", "—", startedAt, asOf, {
      ok: false,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  const fetchRes = await provider.getNews(tickers, lookbackDays);
  const fetchErrorByTicker = new Map(fetchRes.errors.map((e) => [e.ticker, e.error]));
  const fetched = fetchRes.items.length;

  const idFor = (externalId: string) => `${provider.id}-${externalId}`;
  const externalIds = fetchRes.items.map((i) => idFor(i.externalId));
  const existing = externalIds.length > 0
    ? await prisma.news.findMany({
        where: { id: { in: externalIds } },
        select: { id: true },
      })
    : [];
  const existingIds = new Set(existing.map((e) => e.id));

  const newItems = fetchRes.items.filter((i) => !existingIds.has(idFor(i.externalId)));
  const trimmed = newItems.slice(0, maxClassifications);
  const dropped = newItems.length - trimmed.length;

  const companies = await prisma.company.findMany({
    where: { ticker: { in: tickers } },
  });
  const companyByTicker = new Map<string, Company>(
    companies.map((c) => [
      c.ticker,
      {
        ticker: c.ticker,
        name: c.name,
        country: c.country,
        region: c.region as Company["region"],
        sector: c.sector,
        subsector: c.subsector,
        currency: c.currency as Company["currency"],
        marketCapBucket: c.marketCapBucket as Company["marketCapBucket"],
        marketCapUsdBn: c.marketCapUsdBn,
        description: c.description,
        style: c.style as Company["style"],
      },
    ]),
  );

  const theses = await prisma.thesis.findMany({
    where: { ticker: { in: tickers } },
  });
  const thesisByTicker = new Map<string, Thesis>(
    theses.map((t) => [
      t.ticker,
      {
        id: t.id,
        ticker: t.ticker,
        centralThesis: t.centralThesis,
        pillars: t.pillars,
        keyRisks: t.keyRisks,
        catalysts: t.catalysts,
        invalidationPoints: t.invalidationPoints,
        lastReviewDate: t.lastReviewDate.toISOString().slice(0, 10),
        conviction: t.conviction as Thesis["conviction"],
        status: t.status as Thesis["status"],
        decision: t.decision as Thesis["decision"],
      },
    ]),
  );

  const results: NewsItemResult[] = [];
  let inserted = 0;
  let classifyErrors = 0;

  for (const [ticker, error] of fetchErrorByTicker) {
    results.push({ ticker, externalId: "—", status: "fetch-error", error });
  }

  await Promise.all(
    trimmed.map(async (item) => {
      try {
        const classification = await classifyNews({
          item,
          company: companyByTicker.get(item.ticker),
          thesis: thesisByTicker.get(item.ticker),
        });
        await prisma.news.create({
          data: {
            id: idFor(item.externalId),
            ticker: item.ticker,
            date: new Date(item.date),
            title: item.title,
            source: item.source,
            url: item.url,
            category: classification.category,
            sentiment: classification.sentiment,
            thesisImpact: classification.thesisImpact,
            summary: item.summary || classification.reasoning,
          },
        });
        inserted++;
        results.push({
          ticker: item.ticker,
          externalId: item.externalId,
          status: "inserted",
          title: item.title,
          source: item.source,
          sentiment: classification.sentiment,
          thesisImpact: classification.thesisImpact,
          category: classification.category,
          reasoning: classification.reasoning,
        });
      } catch (err) {
        classifyErrors++;
        results.push({
          ticker: item.ticker,
          externalId: item.externalId,
          status: "classify-error",
          title: item.title,
          source: item.source,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }),
  );

  for (const item of newItems.slice(maxClassifications)) {
    results.push({
      ticker: item.ticker,
      externalId: item.externalId,
      status: "skipped",
      title: item.title,
      source: item.source,
      error: `Saltada (límite de ${maxClassifications} clasificaciones por ejecución)`,
    });
  }

  for (const item of fetchRes.items) {
    if (existingIds.has(idFor(item.externalId))) {
      results.push({
        ticker: item.ticker,
        externalId: item.externalId,
        status: "skipped",
        title: item.title,
        source: item.source,
      });
    }
  }

  return {
    ok: true,
    provider: provider.id,
    model: process.env.ANTHROPIC_MODEL ?? "claude-opus-4-7",
    durationMs: Date.now() - startedAt,
    asOf,
    fetched,
    newCandidates: newItems.length,
    inserted,
    classifyErrors,
    items: results,
    message: dropped > 0
      ? `${dropped} noticias adicionales encontradas no clasificadas por límite (${maxClassifications}). Ejecuta de nuevo para procesarlas.`
      : undefined,
  };
}

function base(
  provider: string,
  model: string,
  startedAt: number,
  asOf: string,
  override: Partial<RefreshNewsResult>,
): RefreshNewsResult {
  return {
    ok: false,
    provider,
    model,
    durationMs: Date.now() - startedAt,
    asOf,
    fetched: 0,
    newCandidates: 0,
    inserted: 0,
    classifyErrors: 0,
    items: [],
    ...override,
  };
}
