import type {
  Company, Position, Transaction, Thesis, ValuationModel, EarningsItem, NewsItem,
  CalendarEvent, Alert, IdeaPipelineItem, WatchlistItem, Sector, MonthlyReturn,
  NavPoint, AgentSkill, AgentRun, ResearchTask, PortfolioKPIs, AnnualReturn,
} from "./types";

export const companies: Company[] = [
  { ticker: "BABA", name: "Alibaba Group", country: "China", region: "China", sector: "Consumer Discretionary", subsector: "E-commerce / Cloud", currency: "USD", marketCapBucket: "Large Cap", marketCapUsdBn: 215, description: "Plataforma china líder en e-commerce y cloud computing.", style: "China Recovery" },
  { ticker: "GIS", name: "General Mills", country: "USA", region: "USA", sector: "Consumer Staples", subsector: "Packaged Foods", currency: "USD", marketCapBucket: "Large Cap", marketCapUsdBn: 38, description: "Productor estadounidense de alimentación de marca.", style: "Quality Defensive" },
  { ticker: "MSFT", name: "Microsoft", country: "USA", region: "USA", sector: "Technology", subsector: "Software / Cloud", currency: "USD", marketCapBucket: "Mega Cap", marketCapUsdBn: 3200, description: "Compounder global de software, cloud y AI.", style: "Compounder" },
  { ticker: "NEXI", name: "Nexi S.p.A.", country: "Italia", region: "Europa", sector: "Financials", subsector: "Payments", currency: "EUR", marketCapBucket: "Mid Cap", marketCapUsdBn: 9, description: "PayTech europeo líder con foco en deleveraging.", style: "Deep Value" },
  { ticker: "LVMH", name: "LVMH Moët Hennessy", country: "Francia", region: "Europa", sector: "Consumer Discretionary", subsector: "Luxury", currency: "EUR", marketCapBucket: "Mega Cap", marketCapUsdBn: 360, description: "Líder mundial del lujo con portfolio premium.", style: "Compounder" },
  { ticker: "TSM", name: "Taiwan Semiconductor", country: "Taiwán", region: "Otros", sector: "Technology", subsector: "Semiconductors", currency: "USD", marketCapBucket: "Mega Cap", marketCapUsdBn: 880, description: "Foundry dominante en chips avanzados.", style: "Compounder" },
  { ticker: "NVDA", name: "NVIDIA", country: "USA", region: "USA", sector: "Technology", subsector: "Semiconductors", currency: "USD", marketCapBucket: "Mega Cap", marketCapUsdBn: 2900, description: "Líder global en GPU y stack AI.", style: "Growth" },
  { ticker: "BRK.B", name: "Berkshire Hathaway", country: "USA", region: "USA", sector: "Financials", subsector: "Diversified Holding", currency: "USD", marketCapBucket: "Mega Cap", marketCapUsdBn: 950, description: "Holding diversificado con balance fortaleza.", style: "Quality Defensive" },
  { ticker: "7203.T", name: "Toyota Motor", country: "Japón", region: "Japón", sector: "Consumer Discretionary", subsector: "Autos", currency: "JPY", marketCapBucket: "Large Cap", marketCapUsdBn: 280, description: "Líder automotriz japonés con foco en hybrid.", style: "Quality Defensive" },
  { ticker: "ASML", name: "ASML Holding", country: "Holanda", region: "Europa", sector: "Technology", subsector: "Semicap", currency: "EUR", marketCapBucket: "Mega Cap", marketCapUsdBn: 280, description: "Monopolio de litografía EUV.", style: "Compounder" },
  { ticker: "SHOP", name: "Shopify", country: "Canadá", region: "USA", sector: "Technology", subsector: "E-commerce SaaS", currency: "USD", marketCapBucket: "Large Cap", marketCapUsdBn: 95, description: "Plataforma SaaS de comercio.", style: "Growth" },
  { ticker: "TSLA", name: "Tesla", country: "USA", region: "USA", sector: "Consumer Discretionary", subsector: "Autos / AI", currency: "USD", marketCapBucket: "Mega Cap", marketCapUsdBn: 850, description: "Tesis short corta por valoración elevada.", style: "AI Hedge" },
];

export const positions: Position[] = [
  { ticker: "BABA", quantity: 800, averageCost: 78.5, currentPrice: 90.3, weight: 6.5, marketValue: 72240, unrealizedPnl: 9440, unrealizedPnlPct: 15.0, conviction: "Alta", thesisStatus: "Activa" },
  { ticker: "GIS",  quantity: 700, averageCost: 67.0, currentPrice: 65.0, weight: 4.0, marketValue: 45500, unrealizedPnl: -1400, unrealizedPnlPct: -3.0, conviction: "Media", thesisStatus: "Activa" },
  { ticker: "MSFT", quantity: 280, averageCost: 320,  currentPrice: 432,  weight: 11.2, marketValue: 120960, unrealizedPnl: 31360, unrealizedPnlPct: 35.0, conviction: "Alta", thesisStatus: "Activa" },
  { ticker: "NEXI", quantity: 4200,averageCost: 8.1,  currentPrice: 6.8,  weight: 3.0, marketValue: 28560, unrealizedPnl: -5460, unrealizedPnlPct: -16.0, conviction: "Alta", thesisStatus: "En revisión" },
  { ticker: "LVMH", quantity: 70,  averageCost: 720,  currentPrice: 770,  weight: 4.8, marketValue: 53900, unrealizedPnl: 3500,  unrealizedPnlPct: 6.9, conviction: "Alta", thesisStatus: "Activa" },
  { ticker: "TSM",  quantity: 360, averageCost: 110,  currentPrice: 162,  weight: 5.4, marketValue: 58320, unrealizedPnl: 18720, unrealizedPnlPct: 47.0, conviction: "Alta", thesisStatus: "Activa" },
  { ticker: "NVDA", quantity: 220, averageCost: 380,  currentPrice: 920,  weight: 18.8, marketValue: 202400, unrealizedPnl: 118800, unrealizedPnlPct: 142.0, conviction: "Alta", thesisStatus: "Activa" },
  { ticker: "BRK.B",quantity: 200, averageCost: 360,  currentPrice: 425,  weight: 7.9, marketValue: 85000, unrealizedPnl: 13000, unrealizedPnlPct: 18.0, conviction: "Alta", thesisStatus: "Activa" },
  { ticker: "7203.T", quantity: 3000, averageCost: 2200, currentPrice: 2780, weight: 5.6, marketValue: 60624, unrealizedPnl: 12600, unrealizedPnlPct: 26.0, conviction: "Media", thesisStatus: "Activa" },
  { ticker: "ASML", quantity: 60,  averageCost: 580,  currentPrice: 870,  weight: 5.5, marketValue: 59189, unrealizedPnl: 19386, unrealizedPnlPct: 50.0, conviction: "Alta", thesisStatus: "Activa" },
  { ticker: "SHOP", quantity: 600, averageCost: 60,   currentPrice: 76,   weight: 4.2, marketValue: 45600, unrealizedPnl: 9600, unrealizedPnlPct: 26.7, conviction: "Media", thesisStatus: "Activa" },
  { ticker: "TSLA", quantity: -120,averageCost: 280,  currentPrice: 245,  weight: -2.6, marketValue: -29400, unrealizedPnl: 4200, unrealizedPnlPct: 12.5, conviction: "Media", thesisStatus: "Activa" },
];

export const cashPct = 100 - positions.reduce((acc, p) => acc + Math.abs(p.weight), 0);
export const totalNav = 1078000;

export const kpis: PortfolioKPIs = {
  navCurrent: totalNav,
  navInception: 750000,
  inceptionDate: "2022-01-03",
  dailyReturnPct: 0.42,
  mtdPct: 2.1,
  ytdPct: 8.5,
  cumulativePct: 43.7,
  benchmarkYtdPct: 6.2,
  alphaYtdPct: 2.3,
  volAnnualizedPct: 15.2,
  sharpe: 0.85,
  sortino: 1.18,
  calmar: 0.97,
  maxDrawdownPct: -12.0,
  currentDrawdownPct: -2.4,
  beta: 0.92,
  trackingErrorPct: 4.1,
  informationRatio: 0.56,
  cashPct: 5.4,
  herfindahl: 0.082,
};

// Synthetic NAV series — monthly points from inception
function generateNav(): NavPoint[] {
  const start = new Date("2022-01-03");
  const months = 41; // through May 2026
  const out: NavPoint[] = [];
  let p = 100, b = 100;
  const ptn = [0.7, -1.2, 2.1, 1.4, -2.5, 0.8, 3.2, 1.1, -1.8, 0.4, 2.6, 1.9,
               2.4, -3.1, 1.5, 2.0, 0.9, -0.5, 1.7, 2.3, -1.0, 1.2, 0.6, 2.8,
               1.4, 0.2, -1.1, 2.5, 1.8, 0.7, -0.4, 1.3, 2.1, 1.5, 0.9, 2.2,
               1.1, -0.6, 2.4, 1.9, 2.1];
  const bnt = [0.5, -1.6, 1.4, 1.0, -2.8, 0.4, 2.5, 0.6, -2.2, 0.1, 2.1, 1.2,
               1.6, -3.5, 1.0, 1.4, 0.5, -0.8, 1.1, 1.5, -1.4, 0.7, 0.2, 2.1,
               0.9, -0.1, -1.4, 1.8, 1.3, 0.3, -0.7, 0.8, 1.5, 1.0, 0.5, 1.6,
               0.7, -0.9, 1.7, 1.3, 1.4];
  for (let i = 0; i < months; i++) {
    p = p * (1 + ptn[i] / 100);
    b = b * (1 + bnt[i] / 100);
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);
    out.push({ date: d.toISOString().slice(0, 10), portfolio: +p.toFixed(2), benchmark: +b.toFixed(2) });
  }
  return out;
}

export const navSeries = generateNav();

export const monthlyReturns: MonthlyReturn[] = navSeries.slice(-12).map((p, i, arr) => {
  if (i === 0) return { month: p.date.slice(0, 7), portfolio: 0, benchmark: 0 };
  return {
    month: p.date.slice(0, 7),
    portfolio: +(((p.portfolio / arr[i - 1].portfolio) - 1) * 100).toFixed(2),
    benchmark: +(((p.benchmark / arr[i - 1].benchmark) - 1) * 100).toFixed(2),
  };
});

export const annualReturns: AnnualReturn[] = [
  { year: 2022, portfolio: 9.4, benchmark: 6.8 },
  { year: 2023, portfolio: 15.2, benchmark: 12.4 },
  { year: 2024, portfolio: 18.7, benchmark: 14.1 },
  { year: 2025, portfolio: 14.6, benchmark: 11.2 },
  { year: 2026, portfolio: 8.5, benchmark: 6.2 },
];

export const transactions: Transaction[] = [
  { id: "t1",  date: "2026-05-12", type: "Equity", ticker: "BABA", side: "Compra", quantity: 100, price: 88.4, fees: 1.0, currency: "USD", rationale: "Promediar a valoración atractiva", thesisId: "thesis-BABA-01" },
  { id: "t2",  date: "2026-05-08", type: "Equity", ticker: "NVDA", side: "Venta",  quantity: 30,  price: 905,  fees: 2.0, currency: "USD", rationale: "Toma de beneficios parcial", thesisId: "thesis-NVDA-01" },
  { id: "t3",  date: "2026-04-22", type: "Equity", ticker: "NEXI", side: "Compra", quantity: 1200,price: 7.2,  fees: 0.5, currency: "EUR", rationale: "Pierde nivel técnico, tesis intacta", thesisId: "thesis-NEXI-01" },
  { id: "t4",  date: "2026-04-15", type: "Equity", ticker: "GIS",  side: "Dividendo", quantity: 700, price: 0.59, fees: 0, currency: "USD" },
  { id: "t5",  date: "2026-03-30", type: "Equity", ticker: "ASML", side: "Compra", quantity: 20,  price: 820,  fees: 2.0, currency: "EUR", rationale: "Inicio cobertura semicap", thesisId: "thesis-ASML-01" },
  { id: "t6",  date: "2026-03-12", type: "Equity", ticker: "TSLA", side: "Venta",  quantity: 120, price: 280,  fees: 1.5, currency: "USD", rationale: "Apertura short hedge", thesisId: "thesis-TSLA-01" },
  { id: "t7",  date: "2026-02-20", type: "Equity", ticker: "LVMH", side: "Compra", quantity: 30,  price: 745,  fees: 1.5, currency: "EUR", rationale: "Reapertura tesis China lujo", thesisId: "thesis-LVMH-01" },
  { id: "t8",  date: "2026-02-04", type: "Equity", ticker: "SHOP", side: "Compra", quantity: 300, price: 64,   fees: 1.0, currency: "USD", rationale: "Apertura growth quality", thesisId: "thesis-SHOP-01" },
  { id: "t9",  date: "2026-01-09", type: "Equity", ticker: "MSFT", side: "Compra", quantity: 50,  price: 408,  fees: 1.0, currency: "USD", rationale: "Aumento posición core", thesisId: "thesis-MSFT-01" },
  { id: "t10", date: "2025-12-15", type: "Equity", ticker: "TSM",  side: "Compra", quantity: 120, price: 145,  fees: 1.0, currency: "USD", rationale: "Apertura semicap AI", thesisId: "thesis-TSM-01" },
];

export const theses: Thesis[] = [
  {
    id: "thesis-BABA-01", ticker: "BABA",
    centralThesis: "Alibaba cotiza con descuento extremo frente a su valor intrínseco por presión regulatoria, debilidad macro china y baja confianza inversora. La tesis depende de estabilización del consumo chino, mejora del capital allocation y recuperación de márgenes en Cloud y e-commerce.",
    pillars: ["Recompras agresivas (>10% market cap)", "Recuperación margen Cloud", "Estabilización consumo China", "Sum of the parts >$130"],
    keyRisks: ["Regulación adicional CCP", "FX CNY", "Competencia PDD/Douyin", "Sanciones US"],
    catalysts: ["Q1 results 15-may", "Anuncio adicional buyback", "Spin-off Cainiao", "Estímulos Beijing"],
    invalidationPoints: ["EBIT Cloud <0 dos trimestres", "Recompra suspendida", "Nueva regulación sectorial"],
    lastReviewDate: "2026-05-02", conviction: "Alta", status: "Activa", decision: "Mantener",
  },
  {
    id: "thesis-NVDA-01", ticker: "NVDA",
    centralThesis: "NVIDIA mantiene cuota dominante en GPUs de AI con moat tecnológico vía CUDA + ecosistema. La tesis ya tiene mucho upside descontado; mantener pero tomar beneficios parciales.",
    pillars: ["CUDA moat", "Hyperscaler capex", "Networking (Mellanox)", "Software margins"],
    keyRisks: ["Competencia ASIC custom", "Concentración clientes", "Ciclo capex AI"],
    catalysts: ["Earnings 22-may", "Blackwell ramp", "Sovereign AI demand"],
    invalidationPoints: ["Caída capex hyperscalers >30%", "Inventario en canal"],
    lastReviewDate: "2026-05-01", conviction: "Alta", status: "Activa", decision: "Reducir",
  },
  {
    id: "thesis-NEXI-01", ticker: "NEXI",
    centralThesis: "Nexi es un PayTech europeo descontado por apalancamiento. La tesis se basa en deleveraging acelerado, recompras y expansión margen tras integración.",
    pillars: ["Deleveraging hacia 2.0x", "Recompras 2026-27", "Sinergias integración Nets/SIA", "Crecimiento single-digit volumes"],
    keyRisks: ["FX EUR", "Competencia Adyen/Stripe", "Pricing pressure"],
    catalysts: ["Capital markets day junio", "Q1 results 14-may", "Anuncio buyback"],
    invalidationPoints: ["Net debt no baja", "Volúmenes en caída", "Pérdida cliente clave"],
    lastReviewDate: "2026-04-20", conviction: "Alta", status: "En revisión", decision: "Mantener",
  },
];

export const valuationModels: ValuationModel[] = [
  { id: "BABA_DCF_2026_05", ticker: "BABA", modelType: "DCF",  date: "2026-05-02", fairValue: 120, upsidePct: 33.0, status: "Activo", author: "PM", bear: 78, bull: 155 },
  { id: "BABA_Comps_2026_05", ticker: "BABA", modelType: "Comps", date: "2026-05-02", fairValue: 105, upsidePct: 16.3, status: "Activo", author: "PM" },
  { id: "BABA_SOTP_2026_05", ticker: "BABA", modelType: "SOTP", date: "2026-05-02", fairValue: 130, upsidePct: 44.0, status: "Activo", author: "PM" },
  { id: "NEXI_DCF_2026_04", ticker: "NEXI", modelType: "DCF",  date: "2026-04-20", fairValue: 9.5, upsidePct: 39.7, status: "Activo", author: "PM", bear: 5.5, bull: 12.5 },
  { id: "NVDA_DCF_2026_04", ticker: "NVDA", modelType: "DCF",  date: "2026-04-12", fairValue: 950, upsidePct: 3.3,  status: "Activo", author: "PM" },
  { id: "MSFT_3S_2026_03",  ticker: "MSFT", modelType: "3-Statement", date: "2026-03-08", fairValue: 470, upsidePct: 8.8,  status: "Activo", author: "PM" },
  { id: "GIS_DCF_2025_11",  ticker: "GIS",  modelType: "DCF", date: "2025-11-15", fairValue: 80,  upsidePct: 23.1, status: "Activo", author: "PM" },
];

export const earnings: EarningsItem[] = [
  { ticker: "BABA", period: "Q4 FY25", date: "2026-02-20", revenueSurprisePct: 1.2, epsSurprisePct: 4.5, guidance: "Maintained", stockReactionPct: -1.8, note: "Cloud margen +120bps, e-commerce flat" },
  { ticker: "NVDA", period: "Q1 FY26", date: "2026-02-26", revenueSurprisePct: 3.8, epsSurprisePct: 6.0, guidance: "Raised", stockReactionPct: 8.4, note: "Beat & raise, Blackwell on track" },
  { ticker: "MSFT", period: "Q3 FY26", date: "2026-04-24", revenueSurprisePct: 1.5, epsSurprisePct: 2.2, guidance: "Maintained", stockReactionPct: 1.4, note: "Azure +28% cc, AI revenue >$15B run-rate" },
  { ticker: "NEXI", period: "Q4 FY25", date: "2026-03-04", revenueSurprisePct: -0.5, epsSurprisePct: -2.1, guidance: "Maintained", stockReactionPct: -4.2, note: "Pricing pressure, mix mejor" },
  { ticker: "GIS",  period: "Q3 FY26", date: "2026-03-19", revenueSurprisePct: -1.8, epsSurprisePct: -3.0, guidance: "Lowered", stockReactionPct: -6.1, note: "Volúmenes débiles snacking" },
];

export const news: NewsItem[] = [
  { id: "n1", ticker: "BABA", date: "2026-05-12", title: "Alibaba anuncia ampliación del programa de buyback a $35B", source: "Reuters", category: "Buyback", sentiment: "Positivo", thesisImpact: "Refuerza", summary: "El consejo aprueba aumento del programa de recompras vigente hasta marzo 2027. Implica >12% de market cap actual." },
  { id: "n2", ticker: "BABA", date: "2026-05-10", title: "China estudia nuevas medidas de estímulo al consumo", source: "Bloomberg", category: "Macro", sentiment: "Positivo", thesisImpact: "Refuerza", summary: "Beijing prepara paquete fiscal y subsidios bienes duraderos, foco en consumo doméstico." },
  { id: "n3", ticker: "NVDA", date: "2026-05-11", title: "Microsoft confirma capex AI superior a $90B para 2026", source: "FT", category: "Guidance", sentiment: "Positivo", thesisImpact: "Refuerza", summary: "MSFT incrementa guidance de capex. Soporta demanda Blackwell." },
  { id: "n4", ticker: "GIS",  date: "2026-05-11", title: "General Mills recorta guía anual ante presión en snacking", source: "WSJ", category: "Guidance", sentiment: "Negativo", thesisImpact: "Vigilar", summary: "La compañía rebaja guía de EPS un 3-5%. Cita debilidad en categorías premium." },
  { id: "n5", ticker: "NEXI", date: "2026-05-09", title: "Nexi nombra nuevo CFO con experiencia en deleveraging", source: "Il Sole 24 Ore", category: "Management", sentiment: "Positivo", thesisImpact: "Refuerza", summary: "Ficha de Andrea Tavecchio (ex-Prysmian) refuerza disciplina financiera." },
  { id: "n6", ticker: "TSLA", date: "2026-05-12", title: "NHTSA abre investigación sobre FSD tras nuevos incidentes", source: "Bloomberg", category: "Regulación", sentiment: "Negativo", thesisImpact: "Refuerza", summary: "Investigación regulatoria adicional puede retrasar narrativa robotaxi." },
  { id: "n7", ticker: "ASML", date: "2026-05-08", title: "ASML refuerza pipeline EUV con nuevo pedido de TSMC", source: "Nikkei", category: "Filing", sentiment: "Positivo", thesisImpact: "Refuerza", summary: "Pedido confirmado de 6 unidades High-NA EUV para nodo 2nm." },
  { id: "n8", ticker: "MSFT", date: "2026-05-07", title: "Microsoft completa adquisición de start-up de seguridad cloud", source: "Reuters", category: "M&A", sentiment: "Neutro", thesisImpact: "Neutro", summary: "Adquisición pequeña pero refuerza vertical Defender." },
  { id: "n9", ticker: "LVMH", date: "2026-05-06", title: "LVMH reporta crecimiento orgánico +6% en Q1, China estabiliza", source: "Les Echos", category: "Earnings", sentiment: "Positivo", thesisImpact: "Refuerza", summary: "Wines & Spirits débil, pero Fashion & Leather acelera." },
];

export const calendarEvents: CalendarEvent[] = [
  { id: "e1",  date: "2026-05-14", ticker: "NEXI", title: "Q1 Earnings",            type: "Earnings",     importance: "Alta" },
  { id: "e2",  date: "2026-05-15", ticker: "BABA", title: "Q1 Earnings",            type: "Earnings",     importance: "Alta", notes: "Preparar preview" },
  { id: "e3",  date: "2026-05-20", ticker: "GIS",  title: "Investor Day",           type: "Investor Day", importance: "Media" },
  { id: "e4",  date: "2026-05-22", ticker: "NVDA", title: "Q1 Earnings",            type: "Earnings",     importance: "Alta", notes: "Impacto basket AI" },
  { id: "e5",  date: "2026-05-28", ticker: "ASML", title: "Capital Markets Day",    type: "Investor Day", importance: "Media" },
  { id: "e6",  date: "2026-05-13",                title: "US CPI Abril",            type: "Macro",        importance: "Alta" },
  { id: "e7",  date: "2026-05-21",                title: "FOMC Minutes",            type: "Macro",        importance: "Alta" },
  { id: "e8",  date: "2026-05-30",                title: "PCE Deflator",            type: "Macro",        importance: "Alta" },
  { id: "e9",  date: "2026-06-04",                title: "ECB Meeting",             type: "Macro",        importance: "Alta" },
  { id: "e10", date: "2026-05-17", ticker: "LVMH", title: "Ex-Dividend",            type: "Dividend",     importance: "Baja" },
  { id: "e11", date: "2026-06-11", ticker: "MSFT", title: "Build Conference",       type: "Conference",   importance: "Media" },
  { id: "e12", date: "2026-05-26",                title: "Revisión interna cartera", type: "Internal",     importance: "Media" },
];

export const alerts: Alert[] = [
  { id: "a1", date: "2026-05-12", severity: "Alta",  ticker: "BABA", title: "Earnings en 3 días sin preview generado",         suggestedAction: "Ejecutar earnings-preview" },
  { id: "a2", date: "2026-05-12", severity: "Alta",  ticker: "NVDA", title: "Posición supera 18% — concentración elevada",     suggestedAction: "Revisar portfolio-rebalance" },
  { id: "a3", date: "2026-05-11", severity: "Media", ticker: "NEXI", title: "Drawdown de posición -16%",                       suggestedAction: "Revisar tesis con thesis-tracker" },
  { id: "a4", date: "2026-05-10", severity: "Media", ticker: "GIS",  title: "Modelo DCF no actualizado desde hace 180 días",   suggestedAction: "Ejecutar model-update" },
  { id: "a5", date: "2026-05-09", severity: "Media",                 title: "Exposición Tech 32% — cerca de límite interno",    suggestedAction: "Revisar exposición sectorial" },
  { id: "a6", date: "2026-05-08", severity: "Baja",  ticker: "BABA", title: "Fair value SOTP desactualizado vs cotización +20%", suggestedAction: "Ejecutar valuation-reviewer" },
];

export const ideaPipeline: IdeaPipelineItem[] = [
  { id: "i1", ticker: "BABA", name: "Alibaba",        side: "Long",  sector: "China Tech", status: "En cartera",        conviction: "Alta",  nextStep: "Esperar earnings 15-may" },
  { id: "i2", ticker: "NEXI", name: "Nexi",           side: "Long",  sector: "Payments",   status: "En cartera",        conviction: "Alta",  nextStep: "Revisar CMD junio" },
  { id: "i3", ticker: "TSLA", name: "Tesla short",    side: "Short", sector: "Auto/AI",    status: "En cartera",        conviction: "Media", nextStep: "Revisar valoración" },
  { id: "i4", ticker: "WPP",  name: "WPP plc",        side: "Long",  sector: "Advertising",status: "En research",       conviction: "Media", nextStep: "Construir DCF" },
  { id: "i5", ticker: "DIS",  name: "Walt Disney",    side: "Long",  sector: "Media",      status: "Modelada",          conviction: "Media", nextStep: "Memo pendiente" },
  { id: "i6", ticker: "DG",   name: "Dollar General", side: "Long",  sector: "Retail",     status: "Idea bruta",        conviction: "Baja",  nextStep: "Estudio sectorial" },
  { id: "i7", ticker: "ADYEN", name: "Adyen",         side: "Short", sector: "Payments",   status: "Watchlist",         conviction: "Baja",  nextStep: "Vigilar valoración" },
  { id: "i8", ticker: "MELI", name: "MercadoLibre",   side: "Long",  sector: "LatAm Tech", status: "Memo pendiente",    conviction: "Alta",  nextStep: "Finalizar IC memo" },
];

export const watchlist: WatchlistItem[] = [
  { ticker: "NEXI", name: "Nexi",             fairValue: 9.5, price: 6.8,  upsidePct: 39.7, qualityScore: 7, riskScore: 6, catalyst: "Deleveraging + CMD",     score: 8.1 },
  { ticker: "GIS",  name: "General Mills",    fairValue: 80,  price: 65,   upsidePct: 23.1, qualityScore: 8, riskScore: 3, catalyst: "Margen + buyback",       score: 7.5 },
  { ticker: "WPP",  name: "WPP plc",          fairValue: 12,  price: 7.4,  upsidePct: 62.2, qualityScore: 5, riskScore: 7, catalyst: "Reestructuración",       score: 6.9 },
  { ticker: "DIS",  name: "Walt Disney",      fairValue: 130, price: 102,  upsidePct: 27.5, qualityScore: 7, riskScore: 5, catalyst: "DTC profitability",      score: 7.3 },
  { ticker: "MELI", name: "MercadoLibre",     fairValue: 2200,price: 1750, upsidePct: 25.7, qualityScore: 9, riskScore: 4, catalyst: "Penetración fintech",    score: 8.4 },
  { ticker: "BRK.B",name: "Berkshire",        fairValue: 480, price: 425,  upsidePct: 12.9, qualityScore: 10,riskScore: 2, catalyst: "Cash deployment",        score: 7.8 },
];

export const sectors: Sector[] = [
  { id: "tech",     name: "Technology",       marketSizeUsdBn: 18000, drivers: ["AI capex", "Cloud", "Software margins"], risks: ["Regulación", "Concentración", "Capex sostenible"], topCompanies: ["MSFT","NVDA","ASML","TSM"], avgFwdPE: 28.4, ideasLong: 5, ideasShort: 1 },
  { id: "payments", name: "Payments",         marketSizeUsdBn: 2400,  drivers: ["Digitalización", "B2B payments", "Cross-border"], risks: ["Comoditización", "Competencia neobanks"], topCompanies: ["V","MA","NEXI","ADYEN"], avgFwdPE: 19.8, ideasLong: 2, ideasShort: 1 },
  { id: "luxury",   name: "Luxury",           marketSizeUsdBn: 1500,  drivers: ["Pricing power", "Aspirational consumer", "Asia recovery"], risks: ["China lujo", "Macro EEUU"], topCompanies: ["LVMH","KER","RMS","CFR"], avgFwdPE: 22.5, ideasLong: 2, ideasShort: 0 },
  { id: "staples",  name: "Consumer Staples", marketSizeUsdBn: 4200,  drivers: ["Pricing", "Volumes", "Reformulación"], risks: ["Private label", "Inflación inputs"], topCompanies: ["GIS","K","CL","KMB"], avgFwdPE: 17.2, ideasLong: 2, ideasShort: 0 },
  { id: "china",    name: "China Internet",   marketSizeUsdBn: 1100,  drivers: ["Recompras", "Margen Cloud", "Estímulos"], risks: ["Regulación", "Geopolítica", "FX"], topCompanies: ["BABA","TCEHY","JD","PDD"], avgFwdPE: 11.2, ideasLong: 3, ideasShort: 0 },
  { id: "semis",    name: "Semiconductors",   marketSizeUsdBn: 700,   drivers: ["AI training/inference", "Edge AI", "Foundry"], risks: ["Ciclo", "Geopolítica Taiwán"], topCompanies: ["NVDA","TSM","ASML","AVGO"], avgFwdPE: 26.0, ideasLong: 3, ideasShort: 0 },
];

export const agentSkills: AgentSkill[] = [
  // Análisis
  { id: "idea-generation",      area: "Análisis",  name: "idea-generation",       description: "Genera shortlist de oportunidades long/short por sector o tema.", buttonLabel: "Buscar ideas",          output: "Shortlist de oportunidades" },
  { id: "sector-overview",      area: "Análisis",  name: "sector-overview",       description: "Crea un overview sectorial con drivers, riesgos y comps.",        buttonLabel: "Analizar sector",       output: "Informe sectorial" },
  { id: "competitive-analysis", area: "Análisis",  name: "competitive-analysis",  description: "Construye un mapa competitivo y posicionamiento relativo.",       buttonLabel: "Mapa competitivo",      output: "Deck + análisis" },
  { id: "comps-analysis",       area: "Análisis",  name: "comps-analysis",        description: "Genera tabla de comparables (múltiplos y métricas operativas).",  buttonLabel: "Crear comparables",     output: "Excel de múltiplos" },
  { id: "dcf-model",            area: "Análisis",  name: "dcf-model",             description: "Construye un DCF auditable con sensibilidades.",                   buttonLabel: "Crear DCF",             output: "Excel DCF" },
  { id: "3-statement-model",    area: "Análisis",  name: "3-statement-model",     description: "Modelo P&L + BS + CF integrado.",                                  buttonLabel: "Modelo integrado",      output: "Excel financiero" },
  { id: "earnings-analysis",    area: "Análisis",  name: "earnings-analysis",     description: "Analiza resultados trimestrales y compara vs consenso/modelo.",    buttonLabel: "Analizar resultados",   output: "Earnings note" },
  { id: "initiating-coverage",  area: "Análisis",  name: "initiating-coverage",   description: "Informe completo de iniciación de cobertura.",                     buttonLabel: "Iniciar cobertura",     output: "Informe completo" },
  { id: "model-update",         area: "Análisis",  name: "model-update",          description: "Actualiza un modelo guardado con últimos resultados.",             buttonLabel: "Actualizar modelo",     output: "Modelo actualizado" },
  { id: "thesis-tracker",       area: "Análisis",  name: "thesis-tracker",        description: "Revisa la tesis vigente y emite scorecard.",                       buttonLabel: "Revisar tesis",         output: "Scorecard de tesis" },

  // Control
  { id: "audit-xls",            area: "Control",   name: "audit-xls",             description: "Audita errores y consistencia de un Excel.",                       buttonLabel: "Auditar modelo",        output: "Informe de errores" },
  { id: "portfolio-monitoring", area: "Control",   name: "portfolio-monitoring",  description: "Dashboard de performance y exposición de cartera.",                buttonLabel: "Revisar cartera",       output: "Dashboard" },
  { id: "portfolio-rebalance",  area: "Control",   name: "portfolio-rebalance",   description: "Sugiere trades para volver a pesos target.",                       buttonLabel: "Revisar rebalanceo",    output: "Trades sugeridos" },
  { id: "tax-loss-harvesting",  area: "Control",   name: "tax-loss-harvesting",   description: "Detecta oportunidades de tax-loss harvesting.",                    buttonLabel: "Buscar TLH",            output: "Oportunidades TLH" },
  { id: "valuation-reviewer",   area: "Control",   name: "valuation-reviewer",    description: "Compara fair values vs precio y prioriza acciones.",               buttonLabel: "Revisar valoraciones",  output: "Valuation summary" },
  { id: "catalyst-calendar",    area: "Control",   name: "catalyst-calendar",     description: "Construye calendario de catalizadores por cartera.",               buttonLabel: "Revisar catalizadores", output: "Calendario" },
  { id: "ib-check-deck",        area: "Control",   name: "ib-check-deck",         description: "QC de presentación tipo IB.",                                      buttonLabel: "Revisar deck",          output: "QC report" },

  // Reporting
  { id: "client-report",        area: "Reporting", name: "client-report",         description: "Genera informe mensual/trimestral tipo factsheet.",                buttonLabel: "Generar informe",       output: "PDF mensual/trimestral" },
  { id: "client-review",        area: "Reporting", name: "client-review",         description: "Prepara revisión periódica con cliente.",                          buttonLabel: "Preparar revisión",     output: "Resumen de cartera" },
  { id: "pptx-author",          area: "Reporting", name: "pptx-author",           description: "Genera un deck PowerPoint.",                                       buttonLabel: "Crear deck",            output: "PowerPoint" },
  { id: "deck-refresh",         area: "Reporting", name: "deck-refresh",          description: "Actualiza un deck existente con datos nuevos.",                    buttonLabel: "Actualizar deck",       output: "PPT actualizado" },
  { id: "pitch-deck",           area: "Reporting", name: "pitch-deck",            description: "Crea un pitch deck institucional.",                                buttonLabel: "Rellenar pitch",        output: "Presentación bancaria" },
  { id: "morning-note",         area: "Reporting", name: "morning-note",          description: "Resumen pre-mercado con noticias y eventos relevantes.",           buttonLabel: "Morning Note",          output: "Nota diaria" },

  // Desarrollo de negocio
  { id: "investment-proposal",  area: "Desarrollo de negocio", name: "investment-proposal", description: "Crea propuesta de inversión comercial.", buttonLabel: "Crear propuesta", output: "Deck comercial" },
  { id: "financial-plan",       area: "Desarrollo de negocio", name: "financial-plan",      description: "Crea un plan financiero integral.",       buttonLabel: "Crear plan",      output: "Plan integral" },

  // PE / M&A
  { id: "deal-screening",       area: "Private Equity / M&A", name: "deal-screening",       description: "Filtra un deal con criterios definidos.",          buttonLabel: "Filtrar deal",       output: "Memo rápido" },
  { id: "datapack-builder",     area: "Private Equity / M&A", name: "datapack-builder",     description: "Crea data pack institucional.",                    buttonLabel: "Crear data pack",    output: "Excel institucional" },
  { id: "dd-checklist",         area: "Private Equity / M&A", name: "dd-checklist",         description: "Genera checklist de due diligence.",               buttonLabel: "Crear checklist",    output: "Tracker DD" },
  { id: "lbo-model",            area: "Private Equity / M&A", name: "lbo-model",            description: "Construye modelo LBO.",                            buttonLabel: "Crear LBO",          output: "Modelo LBO" },
  { id: "merger-model",         area: "Private Equity / M&A", name: "merger-model",         description: "Modelo merger con accretion/dilution.",            buttonLabel: "Crear merger",       output: "Modelo merger" },
  { id: "ic-memo",              area: "Private Equity / M&A", name: "ic-memo",              description: "Genera memo de comité de inversión.",              buttonLabel: "Crear IC memo",      output: "Memo de inversión" },
  { id: "value-creation-plan",  area: "Private Equity / M&A", name: "value-creation-plan",  description: "Crea plan de creación de valor (EBITDA bridge).", buttonLabel: "Plan de valor",      output: "EBITDA bridge" },
];

export const agentRuns: AgentRun[] = [
  { id: "ar1", agentName: "earnings-analysis", ticker: "MSFT", date: "2026-04-25", status: "Completado", outputSummary: "Azure +28%, beat & maintain. Tesis intacta." },
  { id: "ar2", agentName: "morning-note",                       date: "2026-05-12", status: "Completado", outputSummary: "Foco: BABA buyback, NHTSA TSLA, CPI mañana." },
  { id: "ar3", agentName: "thesis-tracker",   ticker: "NEXI",  date: "2026-05-11", status: "Completado", outputSummary: "Tesis en revisión: vigilar pricing pressure." },
  { id: "ar4", agentName: "model-update",     ticker: "BABA",  date: "2026-05-02", status: "Completado", outputSummary: "DCF actualizado. FV $120 (+33%)." },
  { id: "ar5", agentName: "audit-xls",        ticker: "GIS",   date: "2026-04-15", status: "Completado", outputSummary: "5 errores menores, sin impacto material." },
  { id: "ar6", agentName: "catalyst-calendar",                 date: "2026-05-12", status: "Completado", outputSummary: "12 eventos próximos 4 semanas." },
];

export const researchQueue: ResearchTask[] = [
  { id: "rq1", task: "Analizar resultados Q1",   ticker: "BABA", skill: "earnings-analysis", priority: "Alta",  status: "Pendiente" },
  { id: "rq2", task: "Actualizar DCF",           ticker: "GIS",  skill: "dcf-model",          priority: "Media", status: "En progreso" },
  { id: "rq3", task: "Revisar tesis short",      ticker: "TSLA", skill: "thesis-tracker",     priority: "Alta",  status: "Pendiente" },
  { id: "rq4", task: "Buscar ideas en pagos",                    skill: "idea-generation",    priority: "Media", status: "Pendiente" },
  { id: "rq5", task: "Preparar earnings preview", ticker: "NVDA", skill: "earnings-preview",  priority: "Alta",  status: "Pendiente" },
  { id: "rq6", task: "Memo IC MercadoLibre",     ticker: "MELI", skill: "ic-memo",            priority: "Media", status: "En progreso" },
];

export function getCompany(ticker: string): Company | undefined {
  return companies.find(c => c.ticker === ticker);
}
export function getPosition(ticker: string): Position | undefined {
  return positions.find(p => p.ticker === ticker);
}
export function getThesisForTicker(ticker: string): Thesis | undefined {
  return theses.find(t => t.ticker === ticker);
}
export function getModelsForTicker(ticker: string): ValuationModel[] {
  return valuationModels.filter(m => m.ticker === ticker);
}
export function getEarningsForTicker(ticker: string): EarningsItem[] {
  return earnings.filter(e => e.ticker === ticker);
}
export function getNewsForTicker(ticker: string): NewsItem[] {
  return news.filter(n => n.ticker === ticker);
}
export function getEventsForTicker(ticker: string): CalendarEvent[] {
  return calendarEvents.filter(e => e.ticker === ticker);
}

// Exposiciones derivadas
export function sectorExposure() {
  const map = new Map<string, number>();
  for (const p of positions) {
    const c = getCompany(p.ticker);
    if (!c) continue;
    map.set(c.sector, (map.get(c.sector) ?? 0) + p.weight);
  }
  return Array.from(map.entries()).map(([sector, weight]) => ({ sector, weight: +weight.toFixed(2) })).sort((a, b) => b.weight - a.weight);
}
export function regionExposure() {
  const map = new Map<string, number>();
  for (const p of positions) {
    const c = getCompany(p.ticker);
    if (!c) continue;
    map.set(c.region, (map.get(c.region) ?? 0) + p.weight);
  }
  map.set("Cash", kpis.cashPct);
  return Array.from(map.entries()).map(([region, weight]) => ({ region, weight: +weight.toFixed(2) })).sort((a, b) => b.weight - a.weight);
}
export function marketCapExposure() {
  const map = new Map<string, number>();
  for (const p of positions) {
    const c = getCompany(p.ticker);
    if (!c) continue;
    map.set(c.marketCapBucket, (map.get(c.marketCapBucket) ?? 0) + p.weight);
  }
  map.set("Cash", kpis.cashPct);
  return Array.from(map.entries()).map(([bucket, weight]) => ({ bucket, weight: +weight.toFixed(2) }));
}
export function currencyExposure() {
  const map = new Map<string, number>();
  for (const p of positions) {
    const c = getCompany(p.ticker);
    if (!c) continue;
    map.set(c.currency, (map.get(c.currency) ?? 0) + p.weight);
  }
  return Array.from(map.entries()).map(([currency, weight]) => ({ currency, weight: +weight.toFixed(2) }));
}
export function topContributors(n = 5) {
  return [...positions]
    .sort((a, b) => b.unrealizedPnlPct * b.weight - a.unrealizedPnlPct * a.weight)
    .slice(0, n)
    .map(p => ({ ticker: p.ticker, name: getCompany(p.ticker)?.name ?? p.ticker, contribPct: +((p.unrealizedPnlPct * p.weight) / 100).toFixed(2), returnPct: p.unrealizedPnlPct }));
}
export function topDetractors(n = 5) {
  return [...positions]
    .sort((a, b) => a.unrealizedPnlPct * a.weight - b.unrealizedPnlPct * b.weight)
    .slice(0, n)
    .map(p => ({ ticker: p.ticker, name: getCompany(p.ticker)?.name ?? p.ticker, contribPct: +((p.unrealizedPnlPct * p.weight) / 100).toFixed(2), returnPct: p.unrealizedPnlPct }));
}
