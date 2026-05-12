# Lynx Capital Terminal

**Portfolio Management OS** — mini-Bloomberg + research workspace + monthly factsheet engine + Claude agents.

Una plataforma privada para gestionar inversiones como si fueras un fondo profesional: cartera, performance, exposiciones, fichas de empresa con tesis, modelos de valoración, earnings, noticias, calendario de catalizadores, monthly factsheets y un panel de agentes Claude contextualizados con todo lo anterior.

## Stack

- Next.js 15 (App Router) + React 19 RC
- TypeScript estricto
- Tailwind CSS (tema dark tipo terminal)
- Recharts para gráficos
- Capa de datos mock (`lib/mock-data.ts`) lista para conectar a backend / Supabase

## Estructura

```
app/
├── page.tsx                     # Dashboard
├── portfolio/
│   ├── page.tsx                 # Posiciones
│   ├── transactions/page.tsx    # Histórico de operaciones
│   ├── performance/page.tsx     # Track record + métricas riesgo
│   └── exposures/page.tsx       # Sector / región / market cap / estilo
├── companies/
│   ├── page.tsx                 # Universo cubierto
│   └── [ticker]/page.tsx        # Ficha completa (tesis, modelos, earnings, news, eventos)
├── research/
│   ├── page.tsx                 # Idea pipeline + watchlist + research queue
│   └── sectors/page.tsx         # Sector library
├── calendar/page.tsx            # Macro + earnings + investor days
├── control/page.tsx             # Control Room (alertas, drift, drawdowns)
├── reporting/page.tsx           # Monthly factsheet
└── agents/page.tsx              # Catálogo Claude agents + runs

components/
├── layout/   Sidebar, Header, SubNav, PageHeader
├── charts/   NavChart, MonthlyBars, ExposurePie, DrawdownChart
└── ui/       Card, Table, Badge, Button, Metric

lib/
├── types.ts        Modelo de dominio
├── mock-data.ts    Dataset realista (positions, theses, models, news...)
└── utils.ts        Formatters, color helpers
```

## Cómo correr

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck
npm run build
```

## Qué está implementado (MVP visible)

- **Dashboard** con 8 KPIs principales, NAV vs benchmark, drawdown histórico, rentabilidad mensual, 4 pies de exposición, top contributors/detractors, alertas, research queue y atajos a agentes.
- **Portfolio**: tabla de posiciones (P/L, peso, convicción, estado tesis), histórico de operaciones, performance vs benchmark con 12 métricas de riesgo, exposiciones por sector/región/market cap/divisa/estilo con overweights vs benchmark.
- **Empresas**: listado y ficha por ticker. La ficha incluye tesis estructurada (pilares / riesgos / catalizadores / invalidación), modelos de valoración con FV base/bear/bull, earnings históricos vs consenso, noticias clasificadas por IA con impacto en tesis, calendario propio y panel de skills.
- **Research**: pipeline de ideas (8 estados), watchlist con scoring, sector library con drivers/riesgos/comps.
- **Calendario**: macro, earnings, investor days, eventos por cartera, alertas activas.
- **Control Room**: alertas con acción sugerida, overweights, drawdowns individuales.
- **Reporting**: monthly factsheet completo (NAV, métricas, anuales, mensuales, top 10, top 5 best/worst, exposiciones, comentario del gestor, cambios en cartera).
- **Claude Agents**: 30+ skills agrupadas por área (Análisis, Control, Reporting, BD, PE/M&A) con catálogo y últimos runs.

## Qué queda fuera del MVP

Esto es el chasis visible. Sigue pendiente conectar:

- **Backend** real (FastAPI / Next API routes) — ahora todo viene de `lib/mock-data.ts`.
- **Base de datos** (Postgres / Supabase) — el modelo en `lib/types.ts` mapea 1:1 con las tablas propuestas.
- **Feeds de mercado** — IBKR Flex / Koyfin / FMP / EODHD / SEC EDGAR.
- **Ejecución real de skills** — los botones de agente todavía no llaman a Claude. La integración debe pasar por la Claude API con prompt caching y herramientas (Memory, Files), y devolver el artefacto al storage de la ficha correspondiente.
- **Auth multi-usuario**, multi-cartera, multi-benchmark.
- **Job runners** para precios, noticias, calendarios.
- **Storage de modelos Excel / PDFs / decks** vinculados por empresa.

## Filosofía de diseño

- **Dark terminal aesthetic** (#0a0d12 base, accent ámbar) — Bloomberg/Koyfin feel.
- **Numeric monospace** con `font-variant-numeric: tabular-nums` para todas las cifras.
- **Densidad alta** sin sacrificar legibilidad — tablas compactas, badges para estado.
- **Navegación jerárquica** por módulos en sidebar + sub-nav por sección.
- **IA contextualizada, no chatbot** — cada skill recibe el contexto que necesita y devuelve un artefacto guardado.
