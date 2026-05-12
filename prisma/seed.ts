/**
 * Idempotent seed: hydrates the DB with everything from lib/mock-data.ts.
 * Safe to run multiple times — uses upsert on natural keys.
 *
 *   npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import {
  companies, positions, transactions, theses, valuationModels, earnings, news,
  calendarEvents, alerts, ideaPipeline, watchlist, sectors, navSeries,
  annualReturns, kpis, totalNav,
} from "../lib/mock-data";

const prisma = new PrismaClient();

const PORTFOLIO_NAME = process.env.LYNX_PORTFOLIO_NAME ?? "Lynx Capital — Global Equity";

async function main() {
  console.log("→ Seeding Lynx Capital Terminal");

  // Portfolio
  let portfolio = await prisma.portfolio.findFirst({ where: { name: PORTFOLIO_NAME } });
  if (!portfolio) {
    portfolio = await prisma.portfolio.create({
      data: {
        name: PORTFOLIO_NAME,
        baseCurrency: "USD",
        inceptionDate: new Date(kpis.inceptionDate),
      },
    });
    console.log(`  Created portfolio ${portfolio.id}`);
  } else {
    console.log(`  Using portfolio ${portfolio.id}`);
  }

  for (const c of companies) {
    await prisma.company.upsert({
      where: { ticker: c.ticker },
      update: { ...c },
      create: { ...c },
    });
  }
  console.log(`  Upserted ${companies.length} companies`);

  for (const p of positions) {
    await prisma.position.upsert({
      where: { portfolioId_ticker: { portfolioId: portfolio.id, ticker: p.ticker } },
      update: { ...p, portfolioId: portfolio.id },
      create: { ...p, portfolioId: portfolio.id },
    });
  }
  console.log(`  Upserted ${positions.length} positions`);

  for (const t of transactions) {
    await prisma.transaction.upsert({
      where: { id: t.id },
      update: {
        portfolioId: portfolio.id, date: new Date(t.date), type: t.type,
        ticker: t.ticker, side: t.side, quantity: t.quantity, price: t.price,
        fees: t.fees, currency: t.currency, rationale: t.rationale, thesisId: t.thesisId,
      },
      create: {
        id: t.id, portfolioId: portfolio.id, date: new Date(t.date), type: t.type,
        ticker: t.ticker, side: t.side, quantity: t.quantity, price: t.price,
        fees: t.fees, currency: t.currency, rationale: t.rationale, thesisId: t.thesisId,
      },
    });
  }
  console.log(`  Upserted ${transactions.length} transactions`);

  for (const t of theses) {
    await prisma.thesis.upsert({
      where: { id: t.id },
      update: {
        ticker: t.ticker, centralThesis: t.centralThesis, pillars: t.pillars,
        keyRisks: t.keyRisks, catalysts: t.catalysts, invalidationPoints: t.invalidationPoints,
        lastReviewDate: new Date(t.lastReviewDate), conviction: t.conviction,
        status: t.status, decision: t.decision,
      },
      create: {
        id: t.id, ticker: t.ticker, centralThesis: t.centralThesis, pillars: t.pillars,
        keyRisks: t.keyRisks, catalysts: t.catalysts, invalidationPoints: t.invalidationPoints,
        lastReviewDate: new Date(t.lastReviewDate), conviction: t.conviction,
        status: t.status, decision: t.decision,
      },
    });
  }
  console.log(`  Upserted ${theses.length} theses`);

  for (const m of valuationModels) {
    await prisma.valuationModel.upsert({
      where: { id: m.id },
      update: {
        ticker: m.ticker, modelType: m.modelType, date: new Date(m.date),
        fairValue: m.fairValue, upsidePct: m.upsidePct, bear: m.bear, bull: m.bull,
        status: m.status, author: m.author,
      },
      create: {
        id: m.id, ticker: m.ticker, modelType: m.modelType, date: new Date(m.date),
        fairValue: m.fairValue, upsidePct: m.upsidePct, bear: m.bear, bull: m.bull,
        status: m.status, author: m.author,
      },
    });
  }
  console.log(`  Upserted ${valuationModels.length} valuation models`);

  for (const e of earnings) {
    await prisma.earnings.upsert({
      where: { ticker_period: { ticker: e.ticker, period: e.period } },
      update: {
        date: new Date(e.date), revenueSurprisePct: e.revenueSurprisePct,
        epsSurprisePct: e.epsSurprisePct, guidance: e.guidance,
        stockReactionPct: e.stockReactionPct, note: e.note,
      },
      create: {
        ticker: e.ticker, period: e.period, date: new Date(e.date),
        revenueSurprisePct: e.revenueSurprisePct, epsSurprisePct: e.epsSurprisePct,
        guidance: e.guidance, stockReactionPct: e.stockReactionPct, note: e.note,
      },
    });
  }
  console.log(`  Upserted ${earnings.length} earnings rows`);

  for (const n of news) {
    await prisma.news.upsert({
      where: { id: n.id },
      update: {
        ticker: n.ticker, date: new Date(n.date), title: n.title, source: n.source,
        url: n.url, category: n.category, sentiment: n.sentiment,
        thesisImpact: n.thesisImpact, summary: n.summary,
      },
      create: {
        id: n.id, ticker: n.ticker, date: new Date(n.date), title: n.title,
        source: n.source, url: n.url, category: n.category, sentiment: n.sentiment,
        thesisImpact: n.thesisImpact, summary: n.summary,
      },
    });
  }
  console.log(`  Upserted ${news.length} news items`);

  for (const e of calendarEvents) {
    await prisma.calendarEvent.upsert({
      where: { id: e.id },
      update: {
        date: new Date(e.date), ticker: e.ticker, title: e.title,
        type: e.type, importance: e.importance, notes: e.notes,
      },
      create: {
        id: e.id, date: new Date(e.date), ticker: e.ticker, title: e.title,
        type: e.type, importance: e.importance, notes: e.notes,
      },
    });
  }
  console.log(`  Upserted ${calendarEvents.length} calendar events`);

  for (const a of alerts) {
    await prisma.alert.upsert({
      where: { id: a.id },
      update: {
        date: new Date(a.date), severity: a.severity, title: a.title,
        context: a.context, suggestedAction: a.suggestedAction, ticker: a.ticker,
      },
      create: {
        id: a.id, date: new Date(a.date), severity: a.severity, title: a.title,
        context: a.context, suggestedAction: a.suggestedAction, ticker: a.ticker,
      },
    });
  }
  console.log(`  Upserted ${alerts.length} alerts`);

  for (const i of ideaPipeline) {
    await prisma.ideaPipelineItem.upsert({
      where: { id: i.id },
      update: { ticker: i.ticker, name: i.name, side: i.side, sector: i.sector, status: i.status, conviction: i.conviction, nextStep: i.nextStep },
      create: { id: i.id, ticker: i.ticker, name: i.name, side: i.side, sector: i.sector, status: i.status, conviction: i.conviction, nextStep: i.nextStep },
    });
  }
  console.log(`  Upserted ${ideaPipeline.length} idea pipeline items`);

  for (const w of watchlist) {
    await prisma.watchlistItem.upsert({
      where: { ticker: w.ticker },
      update: { ...w },
      create: { ...w },
    });
  }
  console.log(`  Upserted ${watchlist.length} watchlist items`);

  for (const s of sectors) {
    await prisma.sector.upsert({
      where: { id: s.id },
      update: { ...s },
      create: { ...s },
    });
  }
  console.log(`  Upserted ${sectors.length} sectors`);

  for (const p of navSeries) {
    await prisma.navPoint.upsert({
      where: { portfolioId_date: { portfolioId: portfolio.id, date: new Date(p.date) } },
      update: { portfolioNav: p.portfolio, benchmark: p.benchmark },
      create: { portfolioId: portfolio.id, date: new Date(p.date), portfolioNav: p.portfolio, benchmark: p.benchmark },
    });
  }
  console.log(`  Upserted ${navSeries.length} NAV points`);

  for (const a of annualReturns) {
    await prisma.annualReturn.upsert({
      where: { portfolioId_year: { portfolioId: portfolio.id, year: a.year } },
      update: { portfolioReturn: a.portfolio, benchmark: a.benchmark },
      create: { portfolioId: portfolio.id, year: a.year, portfolioReturn: a.portfolio, benchmark: a.benchmark },
    });
  }
  console.log(`  Upserted ${annualReturns.length} annual returns`);

  const asOf = new Date("2026-05-12");
  await prisma.portfolioKpi.upsert({
    where: { portfolioId_asOf: { portfolioId: portfolio.id, asOf } },
    update: { ...kpis, inceptionDate: new Date(kpis.inceptionDate), navCurrent: totalNav },
    create: { portfolioId: portfolio.id, asOf, ...kpis, inceptionDate: new Date(kpis.inceptionDate), navCurrent: totalNav },
  });
  console.log(`  Upserted KPI snapshot`);

  console.log("✓ Seed complete");
  console.log(`\nPortfolio ID for env: ${portfolio.id}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
