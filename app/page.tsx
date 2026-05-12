import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Metric } from "@/components/ui/Metric";
import { Badge } from "@/components/ui/Badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { PageHeader } from "@/components/layout/PageHeader";
import { NavChart } from "@/components/charts/NavChart";
import { ExposurePie } from "@/components/charts/ExposurePie";
import { MonthlyBars } from "@/components/charts/MonthlyBars";
import { DrawdownChart } from "@/components/charts/DrawdownChart";
import { RunButton } from "@/components/agents/RunButton";
import {
  kpis, navSeries, sectorExposure, regionExposure, marketCapExposure,
  topContributors, topDetractors, alerts, monthlyReturns, researchQueue,
} from "@/lib/mock-data";
import { fmtMoney, fmtPct, pnlColor, severityColor } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Centro de mando · resumen de cartera, performance y catalizadores"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 mb-5">
        <Metric label="NAV actual" value={fmtMoney(kpis.navCurrent)} sub={`desde ${kpis.inceptionDate}`} />
        <Metric label="Día" value={fmtPct(kpis.dailyReturnPct)} delta={kpis.dailyReturnPct} />
        <Metric label="MTD" value={fmtPct(kpis.mtdPct)} delta={kpis.mtdPct} />
        <Metric label="YTD" value={fmtPct(kpis.ytdPct)} sub={`Benchmark ${fmtPct(kpis.benchmarkYtdPct)}`} delta={kpis.ytdPct} />
        <Metric label="Alpha YTD" value={fmtPct(kpis.alphaYtdPct)} delta={kpis.alphaYtdPct} />
        <Metric label="Sharpe" value={kpis.sharpe.toFixed(2)} sub={`Sortino ${kpis.sortino.toFixed(2)}`} />
        <Metric label="Max DD" value={fmtPct(kpis.maxDrawdownPct, 1)} sub={`Actual ${fmtPct(kpis.currentDrawdownPct, 1)}`} tone="neg" />
        <Metric label="Beta" value={kpis.beta.toFixed(2)} sub={`Vol ${kpis.volAnnualizedPct.toFixed(1)}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <Card className="lg:col-span-2">
          <CardHeader title="Evolución NAV vs Benchmark" subtitle="Desde inicio · mensual" />
          <CardBody>
            <NavChart data={navSeries} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Drawdown histórico" subtitle="% desde máximos" />
          <CardBody>
            <DrawdownChart data={navSeries} />
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <Card>
          <CardHeader title="Rentabilidad mensual (últimos 12m)" subtitle="Cartera vs benchmark" />
          <CardBody>
            <MonthlyBars data={monthlyReturns} />
          </CardBody>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="Por sector" />
            <CardBody><ExposurePie data={sectorExposure()} labelKey="sector" /></CardBody>
          </Card>
          <Card>
            <CardHeader title="Por región" />
            <CardBody><ExposurePie data={regionExposure()} labelKey="region" /></CardBody>
          </Card>
          <Card>
            <CardHeader title="Por market cap" />
            <CardBody><ExposurePie data={marketCapExposure()} labelKey="bucket" /></CardBody>
          </Card>
          <Card>
            <CardHeader title="Convicción" />
            <CardBody>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between"><span className="text-fg-muted">Alta</span><span className="numeric">76.7%</span></li>
                <li className="flex justify-between"><span className="text-fg-muted">Media</span><span className="numeric">23.3%</span></li>
                <li className="flex justify-between"><span className="text-fg-muted">Baja</span><span className="numeric">0.0%</span></li>
              </ul>
              <div className="mt-3 pt-3 border-t border-border-subtle text-2xs text-fg-muted">
                Top 5 = 50.1% · Top 10 = 76.9% · HHI = {kpis.herfindahl.toFixed(3)}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <Card>
          <CardHeader title="Top contributors" subtitle="Aportación ponderada acumulada" />
          <CardBody className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Ticker</TH>
                  <TH align="right">Return</TH>
                  <TH align="right">Contrib.</TH>
                </TR>
              </THead>
              <TBody>
                {topContributors().map((c) => (
                  <TR key={c.ticker}>
                    <TD>
                      <Link className="text-accent hover:underline" href={`/companies/${encodeURIComponent(c.ticker)}`}>{c.ticker}</Link>
                      <span className="ml-2 text-fg-muted text-xs">{c.name}</span>
                    </TD>
                    <TD numeric align="right" className={pnlColor(c.returnPct)}>{fmtPct(c.returnPct, 1)}</TD>
                    <TD numeric align="right" className={pnlColor(c.contribPct)}>{fmtPct(c.contribPct, 2)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Top detractors" subtitle="Aportación negativa" />
          <CardBody className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Ticker</TH>
                  <TH align="right">Return</TH>
                  <TH align="right">Contrib.</TH>
                </TR>
              </THead>
              <TBody>
                {topDetractors().map((c) => (
                  <TR key={c.ticker}>
                    <TD>
                      <Link className="text-accent hover:underline" href={`/companies/${encodeURIComponent(c.ticker)}`}>{c.ticker}</Link>
                      <span className="ml-2 text-fg-muted text-xs">{c.name}</span>
                    </TD>
                    <TD numeric align="right" className={pnlColor(c.returnPct)}>{fmtPct(c.returnPct, 1)}</TD>
                    <TD numeric align="right" className={pnlColor(c.contribPct)}>{fmtPct(c.contribPct, 2)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Alertas" subtitle="Control Room"
            action={<Link className="text-2xs text-accent hover:underline" href="/control">Ver todas →</Link>} />
          <CardBody className="space-y-2">
            {alerts.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-start gap-2 text-sm">
                <span className={`inline-flex shrink-0 rounded border px-1.5 py-0.5 text-2xs uppercase font-medium ${severityColor(a.severity)}`}>
                  {a.severity}
                </span>
                <div className="min-w-0">
                  <div className="text-fg leading-tight">{a.ticker && <span className="font-medium mr-1">{a.ticker}</span>}{a.title}</div>
                  {a.suggestedAction && <div className="text-2xs text-fg-muted mt-0.5">→ {a.suggestedAction}</div>}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Research Queue" subtitle="Cola de trabajo priorizada"
            action={<Link className="text-2xs text-accent hover:underline" href="/research">Ver todas →</Link>} />
          <CardBody className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Tarea</TH>
                  <TH>Empresa</TH>
                  <TH>Skill</TH>
                  <TH>Prioridad</TH>
                  <TH>Estado</TH>
                </TR>
              </THead>
              <TBody>
                {researchQueue.map((r) => (
                  <TR key={r.id}>
                    <TD>{r.task}</TD>
                    <TD>{r.ticker ? <Link className="text-accent hover:underline" href={`/companies/${encodeURIComponent(r.ticker)}`}>{r.ticker}</Link> : "—"}</TD>
                    <TD><code className="text-2xs text-fg-muted">{r.skill}</code></TD>
                    <TD><Badge tone={r.priority === "Alta" ? "neg" : r.priority === "Media" ? "warn" : "muted"}>{r.priority}</Badge></TD>
                    <TD className="text-fg-muted text-xs">{r.status}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Acciones rápidas" subtitle="Lanzar agentes Claude sobre tu cartera" />
          <CardBody>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Morning Note", skill: "morning-note", active: true },
                { label: "Revisar valoraciones", skill: "valuation-reviewer", active: true },
                { label: "Buscar ideas", skill: "idea-generation", active: true, sector: "Payments" },
                { label: "Revisar cartera", skill: "portfolio-monitoring", active: false },
                { label: "Catalizadores", skill: "catalyst-calendar", active: false },
                { label: "Generar mensual", skill: "client-report", active: false },
              ].map((item) => (
                <div
                  key={item.skill}
                  className="flex flex-col gap-2 rounded-md border border-border bg-bg-elevated p-3"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.active && <Badge tone="pos">activa</Badge>}
                  </div>
                  <code className="text-2xs text-fg-muted">{item.skill}</code>
                  {item.active ? (
                    <RunButton
                      skillId={item.skill}
                      skillName={item.skill}
                      label="Ejecutar"
                      sector={item.sector}
                      variant="secondary"
                    />
                  ) : (
                    <Link href={`/agents#${item.skill}`} className="text-2xs text-accent hover:underline">
                      Ver catálogo →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
