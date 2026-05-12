import {
  kpis, positions, companies, theses, valuationModels, earnings, news,
  calendarEvents, alerts, monthlyReturns, annualReturns, ideaPipeline, watchlist,
  sectorExposure, regionExposure, marketCapExposure, currencyExposure,
  topContributors, topDetractors,
} from "@/lib/mock-data";

/**
 * Build a stable, deterministic context string with all portfolio state.
 * Designed to be cacheable: stable ordering, no timestamps inside, only data.
 * The agent receives this as the cached prefix on every skill run.
 */
export function buildCarteraContext(): string {
  const parts: string[] = [];

  parts.push("# CONTEXTO DE CARTERA — LYNX CAPITAL");
  parts.push("");
  parts.push("Eres el analista senior interno del fondo Lynx Capital. Tienes acceso completo al estado de la cartera, tesis activas, modelos de valoración, earnings recientes, noticias clasificadas y calendario de catalizadores. Tu trabajo es producir output analítico accionable, sin generalidades.");
  parts.push("");

  parts.push("## ESTADO DEL FONDO");
  parts.push(`- NAV actual: ${kpis.navCurrent.toLocaleString("es-ES", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}`);
  parts.push(`- NAV inception: ${kpis.navInception.toLocaleString("es-ES", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} (${kpis.inceptionDate})`);
  parts.push(`- Rentabilidad: día ${kpis.dailyReturnPct.toFixed(2)}% · MTD ${kpis.mtdPct.toFixed(2)}% · YTD ${kpis.ytdPct.toFixed(2)}% · acumulada ${kpis.cumulativePct.toFixed(1)}%`);
  parts.push(`- Benchmark YTD: ${kpis.benchmarkYtdPct.toFixed(2)}% · Alpha YTD: ${kpis.alphaYtdPct.toFixed(2)}%`);
  parts.push(`- Volatilidad ${kpis.volAnnualizedPct.toFixed(1)}% · Sharpe ${kpis.sharpe.toFixed(2)} · Sortino ${kpis.sortino.toFixed(2)} · Calmar ${kpis.calmar.toFixed(2)}`);
  parts.push(`- Max Drawdown ${kpis.maxDrawdownPct.toFixed(1)}% · Current Drawdown ${kpis.currentDrawdownPct.toFixed(1)}%`);
  parts.push(`- Beta ${kpis.beta.toFixed(2)} · Tracking Error ${kpis.trackingErrorPct.toFixed(2)}% · Information Ratio ${kpis.informationRatio.toFixed(2)}`);
  parts.push(`- Cash: ${kpis.cashPct.toFixed(1)}% · Herfindahl: ${kpis.herfindahl.toFixed(3)}`);
  parts.push("");

  parts.push("## RENTABILIDAD ANUAL (cartera vs benchmark)");
  for (const a of annualReturns) {
    parts.push(`- ${a.year}: ${a.portfolio.toFixed(1)}% vs ${a.benchmark.toFixed(1)}% (alpha ${(a.portfolio - a.benchmark).toFixed(1)}%)`);
  }
  parts.push("");

  parts.push("## RENTABILIDAD MENSUAL (últimos 12 meses)");
  for (const m of monthlyReturns) {
    if (m.portfolio === 0 && m.benchmark === 0) continue;
    parts.push(`- ${m.month}: ${m.portfolio.toFixed(2)}% vs ${m.benchmark.toFixed(2)}% (alpha ${(m.portfolio - m.benchmark).toFixed(2)}%)`);
  }
  parts.push("");

  parts.push("## POSICIONES ACTUALES");
  parts.push("(ticker | nombre | sector | país | peso | coste medio | precio | P/L% | convicción | tesis)");
  for (const p of [...positions].sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))) {
    const c = companies.find(x => x.ticker === p.ticker);
    parts.push(`- ${p.ticker} | ${c?.name ?? "—"} | ${c?.sector ?? "—"} | ${c?.country ?? "—"} | ${p.weight.toFixed(2)}% | ${p.averageCost} | ${p.currentPrice} | ${p.unrealizedPnlPct.toFixed(1)}% | ${p.conviction} | ${p.thesisStatus}`);
  }
  parts.push("");

  parts.push("## EXPOSICIONES");
  parts.push("Sectorial: " + sectorExposure().map(s => `${s.sector} ${s.weight.toFixed(1)}%`).join(" · "));
  parts.push("Geográfica: " + regionExposure().map(r => `${r.region} ${r.weight.toFixed(1)}%`).join(" · "));
  parts.push("Market cap: " + marketCapExposure().map(m => `${m.bucket} ${m.weight.toFixed(1)}%`).join(" · "));
  parts.push("Divisa: " + currencyExposure().map(c => `${c.currency} ${c.weight.toFixed(1)}%`).join(" · "));
  parts.push("");

  parts.push("## TOP CONTRIBUTORS");
  for (const c of topContributors()) {
    parts.push(`- ${c.ticker} (${c.name}): return ${c.returnPct.toFixed(1)}% · contribución ${c.contribPct.toFixed(2)}pp`);
  }
  parts.push("");
  parts.push("## TOP DETRACTORS");
  for (const c of topDetractors()) {
    parts.push(`- ${c.ticker} (${c.name}): return ${c.returnPct.toFixed(1)}% · contribución ${c.contribPct.toFixed(2)}pp`);
  }
  parts.push("");

  parts.push("## TESIS ACTIVAS");
  for (const t of theses) {
    parts.push(`### ${t.ticker} (tesis ${t.id}) — estado: ${t.status} · convicción: ${t.conviction} · decisión: ${t.decision}`);
    parts.push(`Tesis central: ${t.centralThesis}`);
    parts.push(`Pilares: ${t.pillars.join(" · ")}`);
    parts.push(`Catalizadores: ${t.catalysts.join(" · ")}`);
    parts.push(`Riesgos clave: ${t.keyRisks.join(" · ")}`);
    parts.push(`Puntos de invalidación: ${t.invalidationPoints.join(" · ")}`);
    parts.push(`Última revisión: ${t.lastReviewDate}`);
    parts.push("");
  }

  parts.push("## MODELOS DE VALORACIÓN ACTIVOS");
  for (const m of valuationModels.filter(v => v.status === "Activo")) {
    parts.push(`- ${m.ticker} | ${m.modelType} | FV ${m.fairValue} (bear ${m.bear ?? "—"} / bull ${m.bull ?? "—"}) | upside ${m.upsidePct.toFixed(1)}% | ${m.date} | ${m.id}`);
  }
  parts.push("");

  parts.push("## EARNINGS RECIENTES");
  for (const e of earnings) {
    parts.push(`- ${e.ticker} ${e.period} (${e.date}): revenue ${e.revenueSurprisePct >= 0 ? "+" : ""}${e.revenueSurprisePct.toFixed(1)}% vs cons · EPS ${e.epsSurprisePct >= 0 ? "+" : ""}${e.epsSurprisePct.toFixed(1)}% · guidance ${e.guidance} · reacción ${e.stockReactionPct >= 0 ? "+" : ""}${e.stockReactionPct.toFixed(1)}% · nota: ${e.note}`);
  }
  parts.push("");

  parts.push("## NOTICIAS CLASIFICADAS (últimas 7 días)");
  for (const n of news) {
    parts.push(`- ${n.date} | ${n.ticker} | ${n.category} | sentimiento ${n.sentiment} | impacto tesis: ${n.thesisImpact} | ${n.source}: ${n.title}`);
    parts.push(`  → ${n.summary}`);
  }
  parts.push("");

  parts.push("## CALENDARIO PRÓXIMOS EVENTOS");
  for (const e of [...calendarEvents].sort((a, b) => a.date.localeCompare(b.date))) {
    parts.push(`- ${e.date} | ${e.ticker ?? "MACRO"} | ${e.type} | importancia ${e.importance} | ${e.title}${e.notes ? " — " + e.notes : ""}`);
  }
  parts.push("");

  parts.push("## ALERTAS ACTIVAS (Control Room)");
  for (const a of alerts) {
    parts.push(`- [${a.severity}] ${a.date} ${a.ticker ?? ""} — ${a.title}${a.suggestedAction ? " (sugerido: " + a.suggestedAction + ")" : ""}`);
  }
  parts.push("");

  parts.push("## PIPELINE DE IDEAS");
  for (const i of ideaPipeline) {
    parts.push(`- ${i.ticker} (${i.name}) | ${i.side} | ${i.sector} | ${i.status} | convicción ${i.conviction} | próximo paso: ${i.nextStep}`);
  }
  parts.push("");

  parts.push("## WATCHLIST CON SCORING");
  parts.push("(ticker | nombre | FV | precio | upside | calidad | riesgo | catalizador | score)");
  for (const w of [...watchlist].sort((a, b) => b.score - a.score)) {
    parts.push(`- ${w.ticker} | ${w.name} | ${w.fairValue} | ${w.price} | ${w.upsidePct.toFixed(1)}% | ${w.qualityScore}/10 | ${w.riskScore}/10 | ${w.catalyst} | ${w.score.toFixed(1)}`);
  }

  return parts.join("\n");
}

/**
 * Per-ticker mini-context — for skills that focus on one position.
 * Lightweight, attached after the cached cartera context.
 */
export function buildTickerFocus(ticker: string): string {
  const c = companies.find(x => x.ticker === ticker);
  const p = positions.find(x => x.ticker === ticker);
  const t = theses.find(x => x.ticker === ticker);
  const models = valuationModels.filter(m => m.ticker === ticker);
  const tickerEarnings = earnings.filter(e => e.ticker === ticker);
  const tickerNews = news.filter(n => n.ticker === ticker);
  const tickerEvents = calendarEvents.filter(e => e.ticker === ticker);

  const parts: string[] = [];
  parts.push(`# FOCUS: ${ticker}`);
  if (!c) {
    parts.push(`Ticker ${ticker} no encontrado en el universo cubierto.`);
    return parts.join("\n");
  }
  parts.push(`${c.name} — ${c.sector} / ${c.subsector} — ${c.country} (${c.currency}) — ${c.marketCapBucket} (US$${c.marketCapUsdBn}bn) — estilo: ${c.style}`);
  parts.push(c.description);
  parts.push("");
  if (p) {
    parts.push(`### Posición actual`);
    parts.push(`- Peso: ${p.weight.toFixed(2)}%`);
    parts.push(`- Cantidad: ${p.quantity} · coste medio ${p.averageCost} · precio ${p.currentPrice}`);
    parts.push(`- P/L: ${p.unrealizedPnl.toLocaleString("es-ES")} (${p.unrealizedPnlPct.toFixed(1)}%)`);
    parts.push(`- Convicción: ${p.conviction} · Tesis: ${p.thesisStatus}`);
  } else {
    parts.push(`No en cartera.`);
  }
  parts.push("");
  if (t) {
    parts.push(`### Tesis ${t.id}`);
    parts.push(t.centralThesis);
    parts.push(`Pilares: ${t.pillars.join(" · ")}`);
    parts.push(`Catalizadores: ${t.catalysts.join(" · ")}`);
    parts.push(`Riesgos: ${t.keyRisks.join(" · ")}`);
    parts.push(`Invalidación: ${t.invalidationPoints.join(" · ")}`);
    parts.push(`Decisión actual: ${t.decision} · última revisión ${t.lastReviewDate}`);
    parts.push("");
  }
  if (models.length) {
    parts.push(`### Modelos de valoración (${models.length})`);
    for (const m of models) parts.push(`- ${m.id} | ${m.modelType} | FV ${m.fairValue} | upside ${m.upsidePct.toFixed(1)}% | ${m.date}`);
    parts.push("");
  }
  if (tickerEarnings.length) {
    parts.push(`### Earnings (${tickerEarnings.length})`);
    for (const e of tickerEarnings) parts.push(`- ${e.period} (${e.date}): rev ${e.revenueSurprisePct.toFixed(1)}% · EPS ${e.epsSurprisePct.toFixed(1)}% · guidance ${e.guidance} · reacción ${e.stockReactionPct.toFixed(1)}% — ${e.note}`);
    parts.push("");
  }
  if (tickerNews.length) {
    parts.push(`### Noticias (${tickerNews.length})`);
    for (const n of tickerNews) parts.push(`- ${n.date} [${n.category}] ${n.sentiment} / impacto ${n.thesisImpact}: ${n.title} (${n.source}) — ${n.summary}`);
    parts.push("");
  }
  if (tickerEvents.length) {
    parts.push(`### Eventos próximos (${tickerEvents.length})`);
    for (const e of tickerEvents) parts.push(`- ${e.date} | ${e.type} | importancia ${e.importance} | ${e.title}`);
    parts.push("");
  }
  return parts.join("\n");
}
