import { prisma, hasDatabase } from "@/lib/db";
import * as mock from "@/lib/mock-data";
import type {
  Thesis, ValuationModel, EarningsItem, NewsItem, CalendarEvent, Alert,
  IdeaPipelineItem, WatchlistItem, Sector, ResearchTask,
} from "@/lib/types";

export async function getTheses(): Promise<Thesis[]> {
  if (!hasDatabase()) return mock.theses;
  const rows = await prisma.thesis.findMany();
  if (rows.length === 0) return mock.theses;
  return rows.map((r) => ({
    id: r.id,
    ticker: r.ticker,
    centralThesis: r.centralThesis,
    pillars: r.pillars,
    keyRisks: r.keyRisks,
    catalysts: r.catalysts,
    invalidationPoints: r.invalidationPoints,
    lastReviewDate: r.lastReviewDate.toISOString().slice(0, 10),
    conviction: r.conviction as Thesis["conviction"],
    status: r.status as Thesis["status"],
    decision: r.decision as Thesis["decision"],
  }));
}

export async function getThesisForTicker(ticker: string): Promise<Thesis | undefined> {
  const all = await getTheses();
  return all.find((t) => t.ticker === ticker);
}

export async function getValuationModels(): Promise<ValuationModel[]> {
  if (!hasDatabase()) return mock.valuationModels;
  const rows = await prisma.valuationModel.findMany({ orderBy: { date: "desc" } });
  if (rows.length === 0) return mock.valuationModels;
  return rows.map((r) => ({
    id: r.id,
    ticker: r.ticker,
    modelType: r.modelType as ValuationModel["modelType"],
    date: r.date.toISOString().slice(0, 10),
    fairValue: r.fairValue,
    upsidePct: r.upsidePct,
    status: r.status as ValuationModel["status"],
    author: r.author,
    bear: r.bear ?? undefined,
    bull: r.bull ?? undefined,
  }));
}

export async function getModelsForTicker(ticker: string): Promise<ValuationModel[]> {
  const all = await getValuationModels();
  return all.filter((m) => m.ticker === ticker);
}

export async function getEarnings(): Promise<EarningsItem[]> {
  if (!hasDatabase()) return mock.earnings;
  const rows = await prisma.earnings.findMany({ orderBy: { date: "desc" } });
  if (rows.length === 0) return mock.earnings;
  return rows.map((r) => ({
    ticker: r.ticker,
    period: r.period,
    date: r.date.toISOString().slice(0, 10),
    revenueSurprisePct: r.revenueSurprisePct,
    epsSurprisePct: r.epsSurprisePct,
    guidance: r.guidance as EarningsItem["guidance"],
    stockReactionPct: r.stockReactionPct,
    note: r.note,
  }));
}

export async function getEarningsForTicker(ticker: string): Promise<EarningsItem[]> {
  const all = await getEarnings();
  return all.filter((e) => e.ticker === ticker);
}

export async function getNews(): Promise<NewsItem[]> {
  if (!hasDatabase()) return mock.news;
  const rows = await prisma.news.findMany({ orderBy: { date: "desc" } });
  if (rows.length === 0) return mock.news;
  return rows.map((r) => ({
    id: r.id,
    ticker: r.ticker,
    date: r.date.toISOString().slice(0, 10),
    title: r.title,
    source: r.source,
    url: r.url ?? undefined,
    category: r.category as NewsItem["category"],
    sentiment: r.sentiment as NewsItem["sentiment"],
    thesisImpact: r.thesisImpact as NewsItem["thesisImpact"],
    summary: r.summary,
  }));
}

export async function getNewsForTicker(ticker: string): Promise<NewsItem[]> {
  const all = await getNews();
  return all.filter((n) => n.ticker === ticker);
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  if (!hasDatabase()) return mock.calendarEvents;
  const rows = await prisma.calendarEvent.findMany({ orderBy: { date: "asc" } });
  if (rows.length === 0) return mock.calendarEvents;
  return rows.map((r) => ({
    id: r.id,
    date: r.date.toISOString().slice(0, 10),
    ticker: r.ticker ?? undefined,
    title: r.title,
    type: r.type as CalendarEvent["type"],
    importance: r.importance as CalendarEvent["importance"],
    notes: r.notes ?? undefined,
  }));
}

export async function getEventsForTicker(ticker: string): Promise<CalendarEvent[]> {
  const all = await getCalendarEvents();
  return all.filter((e) => e.ticker === ticker);
}

export async function getAlerts(): Promise<Alert[]> {
  if (!hasDatabase()) return mock.alerts;
  const rows = await prisma.alert.findMany({ orderBy: { date: "desc" } });
  if (rows.length === 0) return mock.alerts;
  return rows.map((r) => ({
    id: r.id,
    date: r.date.toISOString().slice(0, 10),
    severity: r.severity as Alert["severity"],
    title: r.title,
    context: r.context ?? undefined,
    suggestedAction: r.suggestedAction ?? undefined,
    ticker: r.ticker ?? undefined,
  }));
}

export async function getIdeaPipeline(): Promise<IdeaPipelineItem[]> {
  if (!hasDatabase()) return mock.ideaPipeline;
  const rows = await prisma.ideaPipelineItem.findMany();
  if (rows.length === 0) return mock.ideaPipeline;
  return rows.map((r) => ({
    id: r.id,
    ticker: r.ticker,
    name: r.name,
    side: r.side as IdeaPipelineItem["side"],
    sector: r.sector,
    status: r.status as IdeaPipelineItem["status"],
    conviction: r.conviction as IdeaPipelineItem["conviction"],
    nextStep: r.nextStep,
  }));
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  if (!hasDatabase()) return mock.watchlist;
  const rows = await prisma.watchlistItem.findMany({ orderBy: { score: "desc" } });
  if (rows.length === 0) return mock.watchlist;
  return rows.map((r) => ({
    ticker: r.ticker,
    name: r.name,
    fairValue: r.fairValue,
    price: r.price,
    upsidePct: r.upsidePct,
    qualityScore: r.qualityScore,
    riskScore: r.riskScore,
    catalyst: r.catalyst,
    score: r.score,
  }));
}

export async function getSectors(): Promise<Sector[]> {
  if (!hasDatabase()) return mock.sectors;
  const rows = await prisma.sector.findMany();
  if (rows.length === 0) return mock.sectors;
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    marketSizeUsdBn: r.marketSizeUsdBn,
    drivers: r.drivers,
    risks: r.risks,
    topCompanies: r.topCompanies,
    avgFwdPE: r.avgFwdPE,
    ideasLong: r.ideasLong,
    ideasShort: r.ideasShort,
  }));
}

// Research queue is currently sourced from mock only — it represents
// in-memory PM workflow state. Will migrate to its own table in 2B follow-up.
export async function getResearchQueue(): Promise<ResearchTask[]> {
  return mock.researchQueue;
}
