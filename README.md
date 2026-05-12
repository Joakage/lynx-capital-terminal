# Lynx Capital Terminal

**Portfolio Management OS** — mini-Bloomberg + research workspace + monthly factsheet engine + Claude agents.

Una plataforma privada para gestionar inversiones como si fueras un fondo profesional: cartera, performance, exposiciones, fichas de empresa con tesis, modelos de valoración, earnings, noticias, calendario de catalizadores, monthly factsheets y un panel de agentes Claude **realmente conectados** a tu cartera.

## Stack

- Next.js 15 (App Router) + React 19 RC
- TypeScript estricto
- Tailwind CSS (tema dark tipo terminal)
- Recharts para gráficos
- **`@anthropic-ai/sdk` con prompt caching + adaptive thinking** (claude-opus-4-7)
- Capa de datos mock (`lib/mock-data.ts`) lista para migrar a Supabase/Postgres

## Cómo correr

```bash
cp .env.example .env.local
# añade tu ANTHROPIC_API_KEY
npm install
npm run dev          # http://localhost:3000
```

## Phases

### ✅ Fase 1 — Chasis completo (visible)

Toda la navegación de la spec implementada con datos mock realistas:

- **Dashboard** con 8 KPIs principales, NAV vs benchmark, drawdown, mensuales, 4 pies de exposición, top contributors/detractors, alertas, research queue y atajos a agentes.
- **Portfolio**: posiciones (P/L, peso, convicción, estado tesis), histórico de operaciones, performance vs benchmark con 12 métricas de riesgo, exposiciones por sector/región/market cap/divisa/estilo con overweights vs benchmark.
- **Empresas**: listado + ficha completa por ticker con tesis estructurada, modelos (FV base/bear/bull), earnings vs consenso, noticias clasificadas por IA con impacto en tesis, calendario y value creation plan.
- **Research**: pipeline de ideas (8 estados), watchlist con scoring, sector library.
- **Calendario**: macro, earnings, investor days, eventos por cartera, alertas activas.
- **Control Room**: alertas con acción sugerida, overweights, drawdowns individuales.
- **Reporting**: monthly factsheet completo.
- **Claude Agents**: catálogo de 30+ skills agrupadas por área.

### ✅ Fase 2A — Claude Agents end-to-end

**Los botones de skills realmente llaman a Claude**, con contexto completo de tu cartera y caching de prompt para que cada run sea barato.

**Skills activas hoy:**

| Skill | Área | Dónde se lanza |
|---|---|---|
| `earnings-analysis` | Análisis | Ficha de empresa |
| `thesis-tracker` | Análisis | Ficha de empresa |
| `morning-note` | Reporting | Dashboard · Control Room · `/agents` |
| `valuation-reviewer` | Control | Dashboard · Control Room · `/agents` |
| `idea-generation` | Análisis | Sector Library · Dashboard · `/agents` |

**Arquitectura:**

```
Click "Analizar resultados" en BABA
    │
    ▼
RunButton (client component)
    │  POST /api/agents/run { skillId: "earnings-analysis", ticker: "BABA" }
    ▼
app/api/agents/run/route.ts (server, nodejs runtime)
    │
    ▼
runSkill(skillId, input)  → lib/anthropic/run.ts
    │
    │  1. buildCarteraContext()   → un blob estable con NAV, KPIs, posiciones,
    │     tesis, modelos, earnings, news, calendario, alertas, exposiciones
    │     Va con cache_control: { type: "ephemeral" }  →  cache hit en runs siguientes
    │
    │  2. skill.buildUserInstructions({ticker})  → instrucciones específicas + ticker focus
    │
    │  3. client.messages.create({
    │       model: "claude-opus-4-7",
    │       thinking: { type: "adaptive" },
    │       output_config: { effort: "high" | "xhigh" },
    │       messages: [{ role: "user", content: [cachedContext, instructions] }]
    │     })
    │
    │  4. Persiste el run en data/agent-runs/<id>.json
    │
    ▼
Response con markdown → RunDialog renderiza con react-markdown
    │
    └─ Copiar / Descargar .md / cerrar
```

**Prompt caching**: el contexto de cartera (~5-15K tokens) se cachea con `cache_control: { type: "ephemeral" }`. El primer run paga ~1.25x; runs subsiguientes en la misma ventana de 5 min pagan ~0.1x sobre la parte cacheada. Visible en `RunDialog` (cache write / cache read).

**Storage**: runs persistidos como JSON en `data/agent-runs/`. Sustituible por Supabase en 2B sin tocar UI (la API ya devuelve la misma forma).

**Skills no implementadas** del catálogo (`audit-xls`, `dcf-model`, etc.) aparecen como "pendiente" en la UI — el chasis está, solo falta escribir el prompt y conectar.

### ⏭️ Fase 2B — Database (pendiente)

- Supabase / Postgres con Prisma
- Schema generado desde `lib/types.ts`
- Seed que migra `lib/mock-data.ts` a la DB
- Repository pattern: `lib/data.ts` con fallback a mock si no hay `DATABASE_URL`
- Migra `data/agent-runs/` → tabla `agent_runs`

### ⏭️ Fase 2C — Market data ingest (pendiente)

- Cliente FMP / EODHD para precios diarios
- IBKR Flex Query para operaciones reales
- Worker cron en Next.js (o queue separada) para refrescar
- SEC EDGAR + news APIs para filings y noticias

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
│   └── [ticker]/page.tsx        # Ficha completa
├── research/
│   ├── page.tsx                 # Idea pipeline + watchlist + research queue
│   └── sectors/page.tsx         # Sector library con idea-generation por sector
├── calendar/page.tsx            # Macro + earnings + investor days
├── control/page.tsx             # Control Room
├── reporting/page.tsx           # Monthly factsheet
├── agents/page.tsx              # Catálogo Claude agents + últimos runs (lee data/agent-runs/)
└── api/agents/
    ├── run/route.ts             # POST: ejecuta una skill contra Claude
    └── runs/
        ├── route.ts             # GET: lista runs
        └── [id]/route.ts        # GET: detalle de un run

components/
├── layout/   Sidebar, Header, SubNav, PageHeader
├── charts/   NavChart, MonthlyBars, ExposurePie, DrawdownChart
├── ui/       Card, Table, Badge, Button, Metric
└── agents/   RunButton, RunDialog, MarkdownView, SkillCard

lib/
├── types.ts                     # Modelo de dominio
├── mock-data.ts                 # Dataset realista (positions, theses, models, news...)
├── utils.ts                     # Formatters, color helpers
├── anthropic/
│   ├── client.ts                # SDK client + DEFAULT_MODEL
│   ├── context.ts               # buildCarteraContext + buildTickerFocus
│   ├── run.ts                   # runSkill — Anthropic API call + cache + persist
│   └── skills/
│       ├── index.ts             # registry
│       ├── earnings-analysis.ts
│       ├── thesis-tracker.ts
│       ├── morning-note.ts
│       ├── valuation-reviewer.ts
│       └── idea-generation.ts
└── storage/
    └── agent-runs.ts            # filesystem JSON storage
```

## Filosofía de diseño

- **Dark terminal aesthetic** (#0a0d12 base, accent ámbar) — Bloomberg/Koyfin feel.
- **Numeric monospace** con `font-variant-numeric: tabular-nums` para todas las cifras.
- **Densidad alta** sin sacrificar legibilidad.
- **IA contextualizada, no chatbot** — cada skill recibe el contexto que necesita, devuelve un artefacto, queda guardado.
- **Prompt caching first** — el contexto pesado (estado del fondo) se cachea para que los runs sean baratos.
