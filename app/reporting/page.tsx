import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Metric } from "@/components/ui/Metric";
import { Button } from "@/components/ui/Button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { NavChart } from "@/components/charts/NavChart";
import { ExposurePie } from "@/components/charts/ExposurePie";
import { MonthlyBars } from "@/components/charts/MonthlyBars";
import { getKpis, getNavSeries, getMonthlyReturns, getAnnualReturns, getPositions, getTransactions } from "@/lib/data/portfolio";
import { getCompanies } from "@/lib/data/companies";
import { getExposures, getTopContributors, getTopDetractors } from "@/lib/data/exposures";
import { fmtMoney, fmtPct, pnlColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

const REPORTING_MONTH = "Abril 2026";

export default async function ReportingPage() {
  const [kpis, navSeries, monthlyReturns, annualReturns, positions, companies, transactions, exposures, contributors, detractors] =
    await Promise.all([
      getKpis(),
      getNavSeries(),
      getMonthlyReturns(),
      getAnnualReturns(),
      getPositions(),
      getCompanies(),
      getTransactions(),
      getExposures(),
      getTopContributors(),
      getTopDetractors(),
    ]);
  const byTicker = new Map(companies.map((c) => [c.ticker, c]));
  const sorted = [...positions].sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight)).slice(0, 10);
  const recentChanges = transactions.slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Reporting"
        subtitle={`Monthly Factsheet · ${REPORTING_MONTH}`}
        action={
          <div className="flex gap-2">
            <Button size="sm">Exportar PDF</Button>
            <Button size="sm" variant="primary">Generar nuevo (client-report)</Button>
          </div>
        }
      />

      <Card className="mb-4">
        <CardHeader title="Lynx Capital — Monthly Factsheet" subtitle={REPORTING_MONTH} />
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Metric label="NAV final"          value={fmtMoney(kpis.navCurrent)} sub={`desde ${kpis.inceptionDate}`} />
            <Metric label="Rentabilidad mes"   value={fmtPct(3.20)} delta={3.20} />
            <Metric label="Benchmark mes"      value={fmtPct(2.10)} delta={2.10} />
            <Metric label="Alpha mes"          value={fmtPct(1.10)} delta={1.10} />
            <Metric label="YTD"                value={fmtPct(kpis.ytdPct)} delta={kpis.ytdPct} />
            <Metric label="Cumulativo"         value={fmtPct(kpis.cumulativePct)} delta={kpis.cumulativePct} />
            <Metric label="Volatilidad"        value={`${kpis.volAnnualizedPct.toFixed(1)}%`} />
            <Metric label="Sharpe"             value={kpis.sharpe.toFixed(2)} sub={`Sortino ${kpis.sortino.toFixed(2)}`} />
            <Metric label="Max DD"             value={fmtPct(kpis.maxDrawdownPct, 1)} tone="neg" />
            <Metric label="Calmar"             value={kpis.calmar.toFixed(2)} />
            <Metric label="Beta"               value={kpis.beta.toFixed(2)} />
            <Metric label="Cash"               value={`${kpis.cashPct.toFixed(1)}%`} />
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Evolución NAV vs Benchmark" />
          <CardBody><NavChart data={navSeries} height={280} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Rentabilidad anual" />
          <CardBody className="p-0">
            <Table>
              <THead><TR><TH>Año</TH><TH align="right">Cartera</TH><TH align="right">Bench</TH><TH align="right">Alpha</TH></TR></THead>
              <TBody>
                {annualReturns.map(a => (
                  <TR key={a.year}>
                    <TD>{a.year}</TD>
                    <TD numeric align="right" className={pnlColor(a.portfolio)}>{fmtPct(a.portfolio, 1)}</TD>
                    <TD numeric align="right" className="text-fg-muted">{fmtPct(a.benchmark, 1)}</TD>
                    <TD numeric align="right" className={pnlColor(a.portfolio - a.benchmark)}>{fmtPct(a.portfolio - a.benchmark, 1)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      <Card className="mb-4">
        <CardHeader title="Rentabilidad mensual (últimos 12m)" />
        <CardBody><MonthlyBars data={monthlyReturns} height={240} /></CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader title="Top 10 posiciones" />
          <CardBody className="p-0">
            <Table>
              <THead><TR><TH>Ticker</TH><TH>Sector</TH><TH>País</TH><TH align="right">Peso</TH><TH align="right">P/L</TH></TR></THead>
              <TBody>
                {sorted.map(p => {
                  const c = byTicker.get(p.ticker);
                  return (
                    <TR key={p.ticker}>
                      <TD><Link className="text-accent hover:underline" href={`/companies/${encodeURIComponent(p.ticker)}`}>{p.ticker}</Link></TD>
                      <TD className="text-fg-muted text-xs">{c?.sector}</TD>
                      <TD className="text-fg-muted text-xs">{c?.country}</TD>
                      <TD numeric align="right">{p.weight.toFixed(1)}%</TD>
                      <TD numeric align="right" className={pnlColor(p.unrealizedPnlPct)}>{fmtPct(p.unrealizedPnlPct, 1)}</TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader title="Top 5 mejores del mes" />
            <CardBody className="p-0">
              <Table>
                <THead><TR><TH>Empresa</TH><TH align="right">Return</TH><TH align="right">Contrib.</TH></TR></THead>
                <TBody>
                  {contributors.map(c => (
                    <TR key={c.ticker}>
                      <TD><Link className="text-accent hover:underline" href={`/companies/${encodeURIComponent(c.ticker)}`}>{c.ticker}</Link> <span className="text-fg-muted text-xs ml-1">{c.name}</span></TD>
                      <TD numeric align="right" className={pnlColor(c.returnPct)}>{fmtPct(c.returnPct, 1)}</TD>
                      <TD numeric align="right" className={pnlColor(c.contribPct)}>{fmtPct(c.contribPct, 2)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Top 5 peores del mes" />
            <CardBody className="p-0">
              <Table>
                <THead><TR><TH>Empresa</TH><TH align="right">Return</TH><TH align="right">Contrib.</TH></TR></THead>
                <TBody>
                  {detractors.map(c => (
                    <TR key={c.ticker}>
                      <TD><Link className="text-accent hover:underline" href={`/companies/${encodeURIComponent(c.ticker)}`}>{c.ticker}</Link> <span className="text-fg-muted text-xs ml-1">{c.name}</span></TD>
                      <TD numeric align="right" className={pnlColor(c.returnPct)}>{fmtPct(c.returnPct, 1)}</TD>
                      <TD numeric align="right" className={pnlColor(c.contribPct)}>{fmtPct(c.contribPct, 2)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader title="Exposición sectorial" />
          <CardBody><ExposurePie data={exposures.sector} labelKey="sector" /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Exposición geográfica" />
          <CardBody><ExposurePie data={exposures.region} labelKey="region" /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Distribución por market cap" />
          <CardBody><ExposurePie data={exposures.marketCap} labelKey="bucket" /></CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Comentario del gestor" subtitle="Generado por client-report · pendiente revisión" />
          <CardBody className="space-y-3 text-sm leading-relaxed text-fg">
            <p>
              Abril ha sido un mes constructivo. La cartera ha avanzado un {fmtPct(3.20)} frente al {fmtPct(2.10)} del benchmark,
              generando alpha de {fmtPct(1.10)}. La aportación más relevante ha venido de la exposición a semis (NVDA, TSM, ASML)
              y de la recuperación parcial de Alibaba ante el anuncio de ampliación del programa de buyback.
            </p>
            <p>
              En el lado negativo, General Mills ha penalizado tras rebajar guía por debilidad en snacking premium; mantenemos
              la posición con tesis intacta a la espera del Investor Day de mayo. Nexi continúa en revisión: pricing presión
              sigue siendo el principal punto a vigilar, aunque deleveraging avanza según plan.
            </p>
            <p>
              Cambios principales: aumento parcial en BABA tras corrección, toma de beneficios parcial en NVDA, apertura de
              short hedge en TSLA por valoración y riesgo regulatorio. Liquidez se mantiene en {kpis.cashPct.toFixed(1)}%.
              Riesgos a vigilar próximo mes: CPI EE.UU. el 13-may, FOMC minutes 21-may, y earnings clave de BABA y NVDA.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Cambios en cartera" subtitle="Operaciones del mes" />
          <CardBody className="p-0">
            <Table>
              <THead><TR><TH>Fecha</TH><TH>Ticker</TH><TH>Operación</TH><TH align="right">Cantidad</TH><TH align="right">Precio</TH></TR></THead>
              <TBody>
                {recentChanges.map(t => (
                  <TR key={t.id}>
                    <TD className="numeric text-fg-muted">{t.date}</TD>
                    <TD>{t.ticker}</TD>
                    <TD>{t.side}</TD>
                    <TD numeric align="right">{t.quantity}</TD>
                    <TD numeric align="right">{t.price}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
