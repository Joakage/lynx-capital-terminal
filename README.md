# Lynx Capital Terminal

**Portfolio Management OS** — mini-Bloomberg + research workspace + monthly factsheet engine + Claude agents.

Una plataforma privada para gestionar inversiones como si fueras un fondo profesional: cartera, performance, exposiciones, fichas de empresa con tesis, modelos de valoración, earnings, noticias, calendario de catalizadores, monthly factsheets y un panel de agentes Claude **contextualizados** con tu cartera real.

## Stack

- Next.js 15 (App Router) + React 19 RC, todo en async server components
- TypeScript estricto
- Tailwind CSS (tema dark tipo terminal)
- Recharts para gráficos
- **`@anthropic-ai/sdk` con prompt caching + adaptive thinking** (claude-opus-4-7)
- **Prisma + Postgres** como capa de datos canónica (Supabase/Neon-ready)
- **`yahoo-finance2`** para refresh de cotizaciones (FMP opcional con key)
- Fallback automático a dataset mock en `lib/mock-data.ts` cuando no hay `DATABASE_URL` — cero fricción en dev

## Cómo correr

### Modo dev rápido (sin DB)

```bash
cp .env.example .env.local
# añade tu ANTHROPIC_API_KEY (deja DATABASE_URL vacío)
npm install
npm run dev          # http://localhost:3000
```

La UI funciona contra el mock dataset embebido. Los runs de Claude se guardan en `data/agent-runs/*.json`.

### Modo dev con DB real

```bash
cp .env.example .env.local
# añade ANTHROPIC_API_KEY y DATABASE_URL=postgresql://lynx:lynx@localhost:5432/lynx_terminal?schema=public

docker compose up -d postgres
npm install                # corre `prisma generate` automáticamente
npm run db:migrate         # crea tablas a partir de prisma/schema.prisma
npm run db:seed            # hidrata desde lib/mock-data.ts
npm run dev
```

Cada página detecta `DATABASE_URL`. Si está, lee de Postgres. Si no, usa mock. Mismas interfaces, sin if-else en la UI.

Scripts útiles:

```bash
npm run db:studio   # Prisma Studio (UI para inspeccionar la DB)
npm run db:reset    # tira la DB y vuelve a migrar (sin seed)
npm run db:seed     # re-seed idempotente
npm run typecheck   # tsc --noEmit
```

## Phases

### ✅ Fase 1 — Chasis completo

Toda la navegación implementada con datos mock: Dashboard, Portfolio (posiciones/operaciones/performance/exposures), Companies + ficha por ticker, Research + sectors, Calendar, Control Room, Reporting (monthly factsheet), Claude Agents.

### ✅ Fase 2A — Claude Agents end-to-end

5 skills realmente conectadas a Claude (`claude-opus-4-7` + adaptive thinking + prompt caching):

| Skill | Área | Dónde se lanza |
|---|---|---|
| `earnings-analysis` | Análisis | Ficha de empresa |
| `thesis-tracker` | Análisis | Ficha de empresa |
| `morning-note` | Reporting | Dashboard · Control Room · `/agents` |
| `valuation-reviewer` | Control | Dashboard · Control Room · `/agents` |
| `idea-generation` | Análisis | Sector Library · Dashboard · `/agents` |

El contexto de cartera (~5-15K tokens) viaja con `cache_control: { type: "ephemeral" }`: primer run paga ~1.25x, runs subsiguientes en la ventana de 5 min pagan ~0.1x sobre la parte cacheada.

### ✅ Fase 2B — Database real (Prisma + Postgres)

- `prisma/schema.prisma` modela el dominio completo: Portfolio, Company, Position, Transaction, Thesis, ValuationModel, Earnings, News, CalendarEvent, Alert, IdeaPipelineItem, WatchlistItem, Sector, NavPoint, AnnualReturn, PortfolioKpi, AgentRun.
- `prisma/seed.ts` es idempotente: hidrata todo desde `lib/mock-data.ts`.
- `docker-compose.yml` levanta Postgres 16 local (puerto 5432, credenciales `lynx:lynx`).
- **Capa repositorio** en `lib/data/*` con la misma forma que los exports de `mock-data.ts` pero async. Cuando `DATABASE_URL` está, lee de Prisma; cuando no, devuelve el mock. Cero `if` en la UI.
- **Todas las páginas y `Header` pasan a `async` server components** y consumen `lib/data/*`.
- `lib/anthropic/context.ts` (el prompt cacheable) también lee de la capa de datos: cuando hay DB, el contexto pasado al agente es el de la DB.
- `lib/storage/agent-runs.ts` graba en la tabla `AgentRun` si hay DB; filesystem JSON si no.
- Compatibilidad: el mismo build funciona contra Supabase / Neon / Vercel Postgres / RDS — solo cambia `DATABASE_URL`.

**Migración Phase 2A → 2B:** los runs viejos en `data/agent-runs/*.json` no se migran automáticamente (decisión consciente: empezar limpios en DB). Si los quieres importar, hay un script trivial pendiente.

### ✅ Fase 2C — Market data ingest (quotes + NAV + KPI recompute)

El botón **"Refresh quotes"** (Dashboard y Control Room) dispara un pipeline server-side que:

1. Lee posiciones de la DB
2. Llama al **market data provider** (Yahoo por defecto, FMP opcional) en una sola request
3. Actualiza `Position.currentPrice`, `marketValue`, `unrealizedPnl`, `unrealizedPnlPct` y `weight` para cada ticker
4. Calcula la nueva NAV (carry-forward del cash) y hace **upsert** del `NavPoint` de hoy
5. Recalcula la snapshot completa de KPIs (`PortfolioKpi`) con las fórmulas de Sharpe / Sortino / Calmar / beta / tracking error / information ratio / drawdowns
6. Devuelve el resultado por-ticker al cliente y dispara `router.refresh()` para re-renderizar la UI con los datos nuevos

Es idempotente: ejecutar varias veces el mismo día actualiza el mismo `NavPoint` y `PortfolioKpi` por `asOf=hoy`.

**Setup:**

```bash
# Por defecto Yahoo (sin key)
MARKET_DATA_PROVIDER=yahoo

# O bien FMP (free tier: 250 calls/día)
MARKET_DATA_PROVIDER=fmp
FMP_API_KEY=...
```

**Symbol mapping** vive en `lib/market/symbol-map.ts` — traduce nuestro ticker canónico (p.ej. `BRK.B`, `LVMH`, `NEXI`) al símbolo del provider (`BRK-B`, `MC.PA`, `NEXI.MI`).

### ✅ Fase 2C-news — News ingest + clasificación IA por tesis

El botón **"Refresh news (IA)"** (Control Room) cierra el loop entre los pipelines 2A (agentes) y 2C (datos externos):

1. Para cada posición de la cartera, fetch de noticias recientes del provider (Yahoo por defecto vía `yahoo-finance2.search()`, FMP opcional con texto del artículo cuando hay key).
2. Dedup contra DB usando `News.id = "${provider}-${externalId}"`.
3. Por cada noticia nueva, llamada a Claude (`claude-opus-4-7` con `output_config.format = json_schema` para garantizar el shape) pasándole:
   - Datos de la empresa
   - **La tesis activa entera**: pilares / riesgos / catalizadores / puntos de invalidación
   - Título + fuente + resumen del artículo
4. Claude devuelve `{ sentiment, thesisImpact, category, reasoning }`. `thesisImpact` se evalúa **contra la tesis concreta**, no contra el ticker en abstracto: `Refuerza` / `Neutro` / `Vigilar` / `Invalida`.
5. Upsert en `News`. Las noticias clasificadas aparecen automáticamente en la ficha de cada empresa.

Las llamadas a Claude se paralelizan; cap por defecto en **40 clasificaciones** por refresh para evitar gasto sorpresa. Ajustable vía body: `POST /api/refresh/news { "lookbackDays": 7, "maxClassifications": 40 }`.

**Setup adicional:**

```bash
# NEWS_PROVIDER=yahoo   # (por defecto)
# NEWS_PROVIDER=fmp     # texto del artículo más rico; requiere FMP_API_KEY
```

### ✅ Fase 2C+ — Benchmark · Earnings · IBKR · Cron

Cuatro tuberías adicionales en Control Room que cierran el ciclo de ingesta automatizada:

**Benchmark refresh** — el mismo `POST /api/refresh/quotes` fetchea ahora también `BENCHMARK_TICKER` (default `SPY`). La `Quote` se extendió con `previousClose`; el NAV del benchmark avanza diariamente por `daily_move = price / previousClose`. Si el provider no devuelve `previousClose` se mantiene el valor anterior — degrada elegantemente.

**Earnings calendar refresh** — botón **"Refresh earnings"** → `POST /api/refresh/earnings`. Para cada ticker en cartera, fetcheo de la próxima fecha de earnings (Yahoo via `quoteSummary({modules:["calendarEvents","earnings"]})` o FMP `/api/v3/earning_calendar` para mejor cobertura). Las filas futuras existentes para esos tickers se borran y reinsertan, así que la fecha siempre refleja la siguiente publicación.

**IBKR Flex Query** — botón **"Import IBKR trades"** → `POST /api/refresh/transactions`. Pipeline de dos pasos:
1. `FlexStatementService.SendRequest` con `IBKR_FLEX_TOKEN` + `IBKR_FLEX_QUERY_ID` → recibe `ReferenceCode`.
2. Polling de `FlexStatementService.GetStatement` (12 intentos × 5s) hasta que IBKR genere el XML.
3. Parse con `fast-xml-parser`, mapeo `Trade` → `Transaction` (`tradeID` como id estable, idempotente), auto-creación de la `Company` si no existe (FK constraint), mapeo `assetCategory` → `Equity`/`ETF`/`Bond`/`Option`/`Cash` y `buySell` → `Compra`/`Venta`.

Cómo generar el token + query id: Account Management → Settings → Account Settings → Flex Web Service. La query debe incluir como mínimo la sección Trades.

**Cron / scheduler** — `vercel.json` con 4 crons:

| Endpoint | Schedule | Qué hace |
|---|---|---|
| `/api/refresh/quotes` | `30 21 * * 1-5` | Cierre post-mercado US (M-V) |
| `/api/refresh/news` | `0 7 * * 1-5` | Mañana, antes de la apertura europea |
| `/api/refresh/earnings` | `0 6 * * 1` | Semanal, lunes 06:00 UTC |
| `/api/refresh/transactions` | `0 22 * * 1-5` | Tras cierre US |

Auth gate vía `lib/auth/cron.ts`:
- Si `CRON_SECRET` está set, las routes exigen `Authorization: Bearer ${CRON_SECRET}` (Vercel Cron lo añade automáticamente) **o** una request same-origin (el botón en /control).
- Sin `CRON_SECRET`, no hay auth — modo dev.

**Setup:**

```bash
# Benchmark (default SPY)
BENCHMARK_TICKER=SPY

# Earnings calendar provider (yahoo por defecto, fmp si quieres mejor cobertura)
EARNINGS_PROVIDER=yahoo

# IBKR Flex Query (opcional — solo si quieres ingestar operaciones reales)
IBKR_FLEX_TOKEN=...
IBKR_FLEX_QUERY_ID=...

# Gate de las refresh routes (recomendado en prod)
CRON_SECRET=...
```

**Backlog futuro:**
- Reconciliación de `Position.quantity` derivada de la suma de transacciones (auto-compute desde IBKR).
- Backfill histórico: muchas Flex Queries devuelven sólo el último día. Para historiar, configura una Flex Query con período `Last 365 Days` y corre `/api/refresh/transactions` una vez.
- Dividend / corporate action handling — IBKR Flex también devuelve `<CashTransaction>` con DIVIDEND.
- Reseteo automático de `data/agent-runs/*.json` legacy a la tabla `AgentRun` (script trivial).

## Arquitectura de datos

```
┌──────────────────────────────────────┐
│  Pages (async server components)    │
│  app/page.tsx, /portfolio, /companies, ...
└────────────────┬────────────────────┘
                 │ await getKpis() / getPositions() / ...
                 ▼
┌──────────────────────────────────────┐
│  lib/data/* (repository layer)      │
│  portfolio.ts · companies.ts · research.ts · exposures.ts
└────────────────┬────────────────────┘
                 │ if DATABASE_URL: prisma.{table}.findMany
                 │ else:            return mock.X
                 ▼
       ┌─────────────────┐  ┌──────────────────┐
       │  Postgres       │  │ lib/mock-data.ts │
       │  (Prisma)       │  │ (in-memory)      │
       └─────────────────┘  └──────────────────┘
                 ▲
                 │ npm run db:seed
       prisma/seed.ts ◄── lib/mock-data.ts
```

## Estructura

```
app/
├── page.tsx                     # Dashboard
├── portfolio/{page,transactions,performance,exposures}/
├── companies/{page,[ticker]}/
├── research/{page,sectors}/
├── calendar/page.tsx
├── control/page.tsx             # Control Room
├── reporting/page.tsx           # Monthly factsheet
├── agents/page.tsx              # Catálogo Claude agents + últimos runs
└── api/
    ├── agents/
    │   ├── run/route.ts         # POST: ejecuta una skill contra Claude
    │   └── runs/{route, [id]}/
    └── refresh/
        ├── quotes/route.ts      # POST: refresh de cotizaciones + benchmark + NAV + KPIs
        ├── news/route.ts        # POST: fetch noticias + Claude classify → News
        ├── earnings/route.ts    # POST: próximas earnings dates → CalendarEvent
        └── transactions/route.ts # POST: IBKR Flex Query → Transaction

components/
├── layout/   Sidebar, Header, SubNav, PageHeader
├── charts/   NavChart, MonthlyBars, ExposurePie, DrawdownChart
├── ui/       Card, Table, Badge, Button, Metric
├── agents/   RunButton, RunDialog, MarkdownView, SkillCard
└── market/   RefreshButton, RefreshNewsButton, RefreshEarningsButton, RefreshTransactionsButton

lib/
├── types.ts                     # Modelo de dominio TypeScript
├── mock-data.ts                 # Dataset embebido + seed source
├── utils.ts                     # Formatters, color helpers
├── db.ts                        # Prisma client singleton + hasDatabase()
├── data/                        # ◄── REPOSITORIO ASYNC (Phase 2B)
│   ├── portfolio.ts             #     getKpis, getPositions, getTransactions, ...
│   ├── companies.ts             #     getCompanies, getCompany
│   ├── research.ts              #     getTheses, getValuationModels, getNews, ...
│   └── exposures.ts             #     getExposures, getTopContributors, ...
├── anthropic/
│   ├── client.ts
│   ├── context.ts               # buildCarteraContext (ASYNC, lee de lib/data)
│   ├── run.ts
│   └── skills/{earnings-analysis,thesis-tracker,morning-note,valuation-reviewer,idea-generation}.ts
├── storage/
│   └── agent-runs.ts            # DB cuando hay DATABASE_URL, filesystem cuando no
├── market/                      # ◄── MARKET DATA INGEST (Phase 2C / 2C+)
│   ├── provider.ts              #     MarketDataProvider (Quote.previousClose para benchmark)
│   ├── yahoo.ts                 #     yahoo-finance2 (sin API key)
│   ├── fmp.ts                   #     Financial Modeling Prep (FMP_API_KEY)
│   ├── factory.ts               #     getMarketProvider() según env
│   ├── symbol-map.ts            #     canonical ticker → provider symbol
│   ├── metrics.ts               #     computeKpis() puro
│   ├── refresh.ts               #     orchestrator: quotes + benchmark → Position → NavPoint → KPI
│   ├── earnings-provider.ts     #     EarningsCalendarProvider interface
│   ├── earnings-yahoo.ts        #     Yahoo quoteSummary calendarEvents
│   ├── earnings-fmp.ts          #     FMP /earning_calendar
│   ├── earnings-factory.ts      #     getEarningsProvider()
│   └── refresh-earnings.ts      #     orchestrator: próximas earnings → CalendarEvent
├── news/                        # ◄── NEWS + IA CLASSIFICATION (Phase 2C-news)
│   ├── provider.ts              #     NewsProvider interface
│   ├── yahoo.ts                 #     yahoo-finance2 search()
│   ├── fmp.ts                   #     FMP /stock_news (con texto del artículo)
│   ├── factory.ts               #     getNewsProvider()
│   ├── classify.ts              #     Claude classifier: sentiment + thesisImpact + category
│   └── refresh.ts               #     orchestrator: fetch → dedupe → classify → News.create
├── ibkr/                        # ◄── IBKR FLEX QUERY INGEST (Phase 2C+)
│   ├── flex.ts                  #     send/poll + XML parse (fast-xml-parser)
│   └── refresh.ts               #     orchestrator: Trade → Transaction (idempotent on tradeID)
└── auth/
    └── cron.ts                  #     gate /api/refresh/*: Bearer ${CRON_SECRET} o same-origin

prisma/
├── schema.prisma                # ◄── ESQUEMA CANÓNICO (Phase 2B)
└── seed.ts                      # idempotent upsert desde lib/mock-data.ts

docker-compose.yml               # Postgres 16 local
vercel.json                      # 4 crons + función timeouts (Phase 2C+)
```

## Filosofía de diseño

- **Dark terminal aesthetic** (#0a0d12 base, accent ámbar) — Bloomberg/Koyfin feel.
- **Numeric monospace** con `font-variant-numeric: tabular-nums` para todas las cifras.
- **Densidad alta** sin sacrificar legibilidad.
- **IA contextualizada, no chatbot** — cada skill recibe contexto, devuelve un artefacto, queda guardado.
- **Prompt caching first** — el contexto pesado se cachea para que los runs sean baratos.
- **Capa de datos asincrónica** desde el día 1 — listo para Supabase / Neon / RDS sin tocar UI.
