import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Metric } from "@/components/ui/Metric";
import { Button } from "@/components/ui/Button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import {
  getCompany, getPosition, getThesisForTicker, getModelsForTicker,
  getEarningsForTicker, getNewsForTicker, getEventsForTicker,
} from "@/lib/mock-data";
import { fmtNumber, fmtPct, pnlColor, sentimentColor } from "@/lib/utils";

export default async function CompanyDetail({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker: rawTicker } = await params;
  const ticker = decodeURIComponent(rawTicker);
  const company = getCompany(ticker);
  if (!company) notFound();

  const position = getPosition(ticker);
  const thesis = getThesisForTicker(ticker);
  const models = getModelsForTicker(ticker);
  const earningsList = getEarningsForTicker(ticker);
  const newsList = getNewsForTicker(ticker);
  const events = getEventsForTicker(ticker);

  const activeModel = models.find(m => m.status === "Activo");

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
            <Badge tone="accent">{ticker}</Badge>
            <Badge tone="muted">{company.currency}</Badge>
          </div>
          <p className="mt-1 text-sm text-fg-muted">{company.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-2xs text-fg-muted">
            <span>{company.sector}</span><span>·</span>
            <span>{company.subsector}</span><span>·</span>
            <span>{company.country}</span><span>·</span>
            <span>{company.marketCapBucket}</span><span>·</span>
            <span>US${company.marketCapUsdBn.toLocaleString("es-ES")} bn</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/companies" className="text-2xs text-accent hover:underline">← Empresas</Link>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="primary" size="sm">Earnings preview</Button>
            <Button size="sm">Actualizar modelo</Button>
            <Button size="sm">Revisar tesis</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 my-5">
        <Metric label="Peso cartera" value={position ? `${position.weight.toFixed(2)}%` : "—"} />
        <Metric
          label="Precio"
          value={position ? fmtNumber(position.currentPrice) : "—"}
          sub={position ? `coste medio ${fmtNumber(position.averageCost)}` : undefined}
        />
        <Metric
          label="P/L"
          value={position ? fmtPct(position.unrealizedPnlPct, 1) : "—"}
          delta={position?.unrealizedPnlPct}
        />
        <Metric
          label="Fair value base"
          value={activeModel ? fmtNumber(activeModel.fairValue) : "—"}
          sub={activeModel ? `Upside ${fmtPct(activeModel.upsidePct, 1)}` : undefined}
          tone={activeModel ? (activeModel.upsidePct > 0 ? "pos" : "neg") : "neutral"}
        />
        <Metric label="Convicción" value={position?.conviction ?? thesis?.conviction ?? "—"} />
        <Metric label="Tesis" value={thesis?.status ?? "—"} sub={thesis ? `→ ${thesis.decision}` : undefined} />
      </div>

      {/* Thesis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Tesis de inversión"
            subtitle={thesis ? `Última revisión ${thesis.lastReviewDate}` : "Sin tesis activa"}
            action={<Button size="sm">Editar tesis</Button>}
          />
          <CardBody>
            {thesis ? (
              <>
                <p className="text-sm leading-relaxed text-fg">{thesis.centralThesis}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-2xs uppercase text-fg-muted mb-1.5">Pilares</div>
                    <ul className="space-y-1 text-sm">
                      {thesis.pillars.map(p => <li key={p} className="flex gap-2"><span className="text-pos">✓</span><span>{p}</span></li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="text-2xs uppercase text-fg-muted mb-1.5">Catalizadores</div>
                    <ul className="space-y-1 text-sm">
                      {thesis.catalysts.map(p => <li key={p} className="flex gap-2"><span className="text-accent">◆</span><span>{p}</span></li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="text-2xs uppercase text-fg-muted mb-1.5">Riesgos clave</div>
                    <ul className="space-y-1 text-sm">
                      {thesis.keyRisks.map(p => <li key={p} className="flex gap-2"><span className="text-warn">!</span><span>{p}</span></li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="text-2xs uppercase text-fg-muted mb-1.5">Qué invalidaría la tesis</div>
                    <ul className="space-y-1 text-sm">
                      {thesis.invalidationPoints.map(p => <li key={p} className="flex gap-2"><span className="text-neg">✕</span><span>{p}</span></li>)}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-fg-muted">No hay tesis registrada para este ticker.</div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Acciones (Claude)" subtitle="Skills disponibles para esta ficha" />
          <CardBody className="space-y-1.5">
            {[
              ["Analizar resultados",        "earnings-analysis"],
              ["Earnings preview",            "earnings-preview"],
              ["Actualizar modelo",           "model-update"],
              ["Crear DCF nuevo",             "dcf-model"],
              ["Crear comps",                 "comps-analysis"],
              ["Auditar Excel",               "audit-xls"],
              ["Revisar tesis",               "thesis-tracker"],
              ["Iniciar cobertura",           "initiating-coverage"],
              ["Plan creación de valor",     "value-creation-plan"],
            ].map(([label, skill]) => (
              <button
                key={skill}
                className="w-full flex items-center justify-between rounded-md border border-border bg-bg-elevated hover:bg-bg-hover transition-colors px-3 py-2 text-left"
              >
                <span className="text-sm">{label}</span>
                <code className="text-2xs text-fg-muted">{skill}</code>
              </button>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Models */}
      <Card className="mb-4">
        <CardHeader
          title="Modelos de valoración"
          subtitle={`${models.length} modelos guardados`}
          action={<Button size="sm" variant="primary">+ Nuevo modelo</Button>}
        />
        <CardBody className="p-0">
          {models.length === 0 ? (
            <div className="px-4 py-6 text-sm text-fg-muted">No hay modelos guardados.</div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>ID</TH>
                  <TH>Tipo</TH>
                  <TH>Fecha</TH>
                  <TH align="right">FV base</TH>
                  <TH align="right">Bear</TH>
                  <TH align="right">Bull</TH>
                  <TH align="right">Upside</TH>
                  <TH>Estado</TH>
                  <TH>Autor</TH>
                </TR>
              </THead>
              <TBody>
                {models.map(m => (
                  <TR key={m.id}>
                    <TD><code className="text-2xs text-fg-muted">{m.id}</code></TD>
                    <TD><Badge tone="info">{m.modelType}</Badge></TD>
                    <TD className="text-fg-muted text-xs">{m.date}</TD>
                    <TD numeric align="right">{fmtNumber(m.fairValue, 1)}</TD>
                    <TD numeric align="right" className="text-fg-muted">{m.bear ? fmtNumber(m.bear, 1) : "—"}</TD>
                    <TD numeric align="right" className="text-fg-muted">{m.bull ? fmtNumber(m.bull, 1) : "—"}</TD>
                    <TD numeric align="right" className={pnlColor(m.upsidePct)}>{fmtPct(m.upsidePct, 1)}</TD>
                    <TD><Badge tone={m.status === "Activo" ? "pos" : "muted"}>{m.status}</Badge></TD>
                    <TD className="text-fg-muted text-xs">{m.author}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Earnings */}
      <Card className="mb-4">
        <CardHeader title="Earnings" subtitle="Histórico de resultados" />
        <CardBody className="p-0">
          {earningsList.length === 0 ? (
            <div className="px-4 py-6 text-sm text-fg-muted">Sin earnings registrados.</div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Periodo</TH><TH>Fecha</TH>
                  <TH align="right">Revenue vs cons.</TH><TH align="right">EPS vs cons.</TH>
                  <TH>Guidance</TH><TH align="right">Reacción</TH><TH>Nota</TH>
                </TR>
              </THead>
              <TBody>
                {earningsList.map((e, i) => (
                  <TR key={i}>
                    <TD>{e.period}</TD>
                    <TD className="text-fg-muted text-xs">{e.date}</TD>
                    <TD numeric align="right" className={pnlColor(e.revenueSurprisePct)}>{fmtPct(e.revenueSurprisePct, 1)}</TD>
                    <TD numeric align="right" className={pnlColor(e.epsSurprisePct)}>{fmtPct(e.epsSurprisePct, 1)}</TD>
                    <TD><Badge tone={e.guidance === "Raised" ? "pos" : e.guidance === "Lowered" ? "neg" : "muted"}>{e.guidance}</Badge></TD>
                    <TD numeric align="right" className={pnlColor(e.stockReactionPct)}>{fmtPct(e.stockReactionPct, 1)}</TD>
                    <TD className="text-fg-muted text-xs">{e.note}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* News + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Noticias" subtitle="Clasificadas por IA · impacto en tesis" />
          <CardBody className="space-y-3">
            {newsList.length === 0 && <div className="text-sm text-fg-muted">Sin noticias recientes.</div>}
            {newsList.map(n => (
              <div key={n.id} className="border-b border-border-subtle last:border-b-0 pb-3 last:pb-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 text-2xs text-fg-muted">
                    <span>{n.date}</span><span>·</span><span>{n.source}</span>
                  </div>
                  <div className="flex gap-1">
                    <span className={`inline-flex rounded border px-1.5 py-0.5 text-2xs uppercase font-medium ${sentimentColor(n.sentiment)}`}>{n.sentiment}</span>
                    <Badge tone="muted">{n.category}</Badge>
                  </div>
                </div>
                <div className="text-sm font-medium">{n.title}</div>
                <div className="text-2xs text-fg-muted mt-0.5">{n.summary}</div>
                <div className="mt-1 text-2xs">
                  <span className="text-fg-muted">Impacto tesis: </span>
                  <span className={
                    n.thesisImpact === "Refuerza" ? "text-pos" :
                    n.thesisImpact === "Vigilar" ? "text-warn" :
                    n.thesisImpact === "Invalida" ? "text-neg" : "text-fg-muted"
                  }>{n.thesisImpact}</span>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Calendario de la empresa" />
          <CardBody className="p-0">
            {events.length === 0 ? (
              <div className="px-4 py-6 text-sm text-fg-muted">Sin eventos programados.</div>
            ) : (
              <Table>
                <THead>
                  <TR><TH>Fecha</TH><TH>Evento</TH><TH>Tipo</TH><TH>Importancia</TH></TR>
                </THead>
                <TBody>
                  {events.map(e => (
                    <TR key={e.id}>
                      <TD className="numeric text-fg-muted">{e.date}</TD>
                      <TD>{e.title}</TD>
                      <TD className="text-fg-muted text-xs">{e.type}</TD>
                      <TD><Badge tone={e.importance === "Alta" ? "neg" : e.importance === "Media" ? "warn" : "muted"}>{e.importance}</Badge></TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Value creation plan placeholder */}
      <Card className="mt-4">
        <CardHeader title="Value Creation / Catalyst Plan" subtitle="Palancas, KPIs y impacto sobre la tesis" />
        <CardBody className="p-0">
          <Table>
            <THead>
              <TR><TH>Palanca</TH><TH>Estado actual</TH><TH>Qué debería mejorar</TH><TH>KPI a seguir</TH><TH>Impacto en tesis</TH></TR>
            </THead>
            <TBody>
              <TR><TD>Margen Cloud / segmento estrella</TD><TD className="text-fg-muted text-xs">Bajo presión</TD><TD className="text-fg-muted text-xs">Expansión gradual</TD><TD className="text-fg-muted text-xs">EBIT margin %</TD><TD><Badge tone="neg">Alto</Badge></TD></TR>
              <TR><TD>Recompras / dividendos</TD><TD className="text-fg-muted text-xs">Activos</TD><TD className="text-fg-muted text-xs">Mayor ejecución</TD><TD className="text-fg-muted text-xs">$ recomprado / mcap</TD><TD><Badge tone="warn">Medio</Badge></TD></TR>
              <TR><TD>Crecimiento orgánico</TD><TD className="text-fg-muted text-xs">Estable</TD><TD className="text-fg-muted text-xs">Aceleración LFL</TD><TD className="text-fg-muted text-xs">Organic growth %</TD><TD><Badge tone="warn">Medio</Badge></TD></TR>
            </TBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
