export type Conviction = "Alta" | "Media" | "Baja";
export type ThesisStatus = "Activa" | "En revisión" | "Rota";
export type Action = "Comprar" | "Mantener" | "Aumentar" | "Reducir" | "Vender";
export type AssetClass = "Equity" | "ETF" | "Bond" | "Option" | "Cash";
export type MarketCapBucket = "Mega Cap" | "Large Cap" | "Mid Cap" | "Small Cap" | "Micro Cap" | "Cash";
export type Style = "Compounder" | "Deep Value" | "Special Situation" | "Turnaround" | "Quality Defensive" | "China Recovery" | "AI Hedge" | "Growth";

export interface Company {
  ticker: string;
  name: string;
  country: string;
  region: "USA" | "Europa" | "China" | "Japón" | "LatAm" | "Otros";
  sector: string;
  subsector: string;
  currency: "USD" | "EUR" | "GBP" | "JPY" | "HKD";
  marketCapBucket: MarketCapBucket;
  marketCapUsdBn: number;
  description: string;
  style: Style;
}

export interface Position {
  ticker: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  weight: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  conviction: Conviction;
  thesisStatus: ThesisStatus;
}

export interface Transaction {
  id: string;
  date: string;
  type: AssetClass;
  ticker: string;
  side: "Compra" | "Venta" | "Dividendo" | "Comisión" | "FX";
  quantity: number;
  price: number;
  fees: number;
  currency: string;
  rationale?: string;
  thesisId?: string;
}

export interface Thesis {
  id: string;
  ticker: string;
  centralThesis: string;
  pillars: string[];
  keyRisks: string[];
  catalysts: string[];
  invalidationPoints: string[];
  lastReviewDate: string;
  conviction: Conviction;
  status: ThesisStatus;
  decision: Action;
}

export interface ValuationModel {
  id: string;
  ticker: string;
  modelType: "DCF" | "Comps" | "SOTP" | "3-Statement" | "LBO";
  date: string;
  fairValue: number;
  upsidePct: number;
  status: "Activo" | "Archivado" | "Borrador";
  author: string;
  bear?: number;
  bull?: number;
}

export interface EarningsItem {
  ticker: string;
  period: string;
  date: string;
  revenueSurprisePct: number;
  epsSurprisePct: number;
  guidance: "Raised" | "Maintained" | "Lowered" | "Withdrawn";
  stockReactionPct: number;
  note: string;
}

export interface NewsItem {
  id: string;
  ticker: string;
  date: string;
  title: string;
  source: string;
  url?: string;
  category: "Earnings" | "Guidance" | "M&A" | "Regulación" | "Management" | "Buyback" | "Macro" | "Insider" | "Filing";
  sentiment: "Positivo" | "Neutro" | "Negativo";
  thesisImpact: "Refuerza" | "Neutro" | "Vigilar" | "Invalida";
  summary: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  ticker?: string;
  title: string;
  type: "Earnings" | "Macro" | "Investor Day" | "Dividend" | "Conference" | "Filing" | "Internal";
  importance: "Alta" | "Media" | "Baja";
  notes?: string;
}

export interface Alert {
  id: string;
  date: string;
  severity: "Alta" | "Media" | "Baja";
  title: string;
  context?: string;
  suggestedAction?: string;
  ticker?: string;
}

export interface IdeaPipelineItem {
  id: string;
  ticker: string;
  name: string;
  side: "Long" | "Short";
  sector: string;
  status: "Idea bruta" | "En research" | "Modelada" | "Memo pendiente" | "Aprobada" | "En cartera" | "Watchlist" | "Rechazada";
  conviction: Conviction;
  nextStep: string;
}

export interface WatchlistItem {
  ticker: string;
  name: string;
  fairValue: number;
  price: number;
  upsidePct: number;
  qualityScore: number;
  riskScore: number;
  catalyst: string;
  score: number;
}

export interface Sector {
  id: string;
  name: string;
  marketSizeUsdBn: number;
  drivers: string[];
  risks: string[];
  topCompanies: string[];
  avgFwdPE: number;
  ideasLong: number;
  ideasShort: number;
}

export interface MonthlyReturn {
  month: string;
  portfolio: number;
  benchmark: number;
}

export interface NavPoint {
  date: string;
  portfolio: number;
  benchmark: number;
}

export interface AgentSkill {
  id: string;
  name: string;
  area: "Análisis" | "Control" | "Reporting" | "Desarrollo de negocio" | "Private Equity / M&A";
  description: string;
  buttonLabel: string;
  output: string;
  inputs?: string[];
}

export interface AgentRun {
  id: string;
  agentName: string;
  ticker?: string;
  date: string;
  status: "Pendiente" | "Ejecutándose" | "Completado" | "Error";
  outputSummary?: string;
}

export interface ResearchTask {
  id: string;
  task: string;
  ticker?: string;
  skill: string;
  priority: "Alta" | "Media" | "Baja";
  status: "Pendiente" | "En progreso" | "Completado";
}

export interface PortfolioKPIs {
  navCurrent: number;
  navInception: number;
  inceptionDate: string;
  dailyReturnPct: number;
  mtdPct: number;
  ytdPct: number;
  cumulativePct: number;
  benchmarkYtdPct: number;
  alphaYtdPct: number;
  volAnnualizedPct: number;
  sharpe: number;
  sortino: number;
  calmar: number;
  maxDrawdownPct: number;
  currentDrawdownPct: number;
  beta: number;
  trackingErrorPct: number;
  informationRatio: number;
  cashPct: number;
  herfindahl: number;
}

export interface AnnualReturn {
  year: number;
  portfolio: number;
  benchmark: number;
}
