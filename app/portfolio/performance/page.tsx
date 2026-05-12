import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { NavChart } from "@/components/charts/NavChart";
import { MonthlyBars } from "@/components/charts/MonthlyBars";
import { DrawdownChart } from "@/components/charts/DrawdownChart";
import { getKpis, getNavSeries, getMonthlyReturns, getAnnualReturns } from "@/lib/data/portfolio";
import { fmtPct, pnlColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

function fmt(v: number, digits = 2, suffix = "") {
  return `${v.toFixed(digits)}${suffix}`;
}

export default async function PerformancePage() {
  const [kpis, navSeries, monthlyReturns, annualReturns] = await Promise.all([
    getKpis(),
    getNavSeries(),
    getMonthlyReturns(),
    getAnnualReturns(),
  ]);

  const rows: Array<{ label: string; p: number; b: number; digits?: number; suffix?: string }> = [
    { label: "MTD",               p: kpis.mtdPct,           b: 1.4,                  digits: 2, suffix: "%" },
    { label: "YTD",               p: kpis.ytdPct,           b: kpis.benchmarkYtdPct, digits: 2, suffix: "%" },
    { label: "1 año",             p: 14.2,                  b: 10.8,                 digits: 2, suffix: "%" },
    { label: "CAGR desde inicio", p: 11.6,                  b: 8.1,                  digits: 2, suffix: "%" },
    { label: "Volatilidad",       p: kpis.volAnnualizedPct, b: 17.0,                 digits: 2, suffix: "%" },
    { label: "Sharpe",            p: kpis.sharpe,           b: 0.58,                 digits: 2 },
    { label: "Sortino",           p: kpis.sortino,          b: 0.71,                 digits: 2 },
    { label: "Calmar",            p: kpis.calmar,           b: 0.44,                 digits: 2 },
    { label: "Max Drawdown",      p: kpis.maxDrawdownPct,   b: -18.5,                digits: 1, suffix: "%" },
    { label: "Beta",              p: kpis.beta,             b: 1.0,                  digits: 2 },
    { label: "Tracking error",    p: kpis.trackingErrorPct, b: 0,                    digits: 2, suffix: "%" },
    { label: "Information ratio", p: kpis.informationRatio, b: 0,                    digits: 2 },
  ];

  return (
    <div>
      <PageHeader title="Performance" subtitle="Track record · cartera vs benchmark (MSCI ACWI proxy)" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <CardHeader title="NAV vs Benchmark" />
          <CardBody><NavChart data={navSeries} height={320} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Drawdown" />
          <CardBody><DrawdownChart data={navSeries} height={260} /></CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Métricas de performance y riesgo" subtitle="Cartera vs benchmark" />
          <CardBody className="p-0">
            <Table>
              <THead>
                <TR><TH>Métrica</TH><TH align="right">Cartera</TH><TH align="right">Benchmark</TH><TH align="right">Diferencia</TH></TR>
              </THead>
              <TBody>
                {rows.map((r) => (
                  <TR key={r.label}>
                    <TD className="text-fg">{r.label}</TD>
                    <TD numeric align="right">{fmt(r.p, r.digits, r.suffix)}</TD>
                    <TD numeric align="right" className="text-fg-muted">{fmt(r.b, r.digits, r.suffix)}</TD>
                    <TD numeric align="right" className={pnlColor(r.p - r.b)}>{fmt(r.p - r.b, r.digits, r.suffix)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Rentabilidad anual" />
          <CardBody className="p-0">
            <Table>
              <THead>
                <TR><TH>Año</TH><TH align="right">Cartera</TH><TH align="right">Benchmark</TH><TH align="right">Alpha</TH></TR>
              </THead>
              <TBody>
                {annualReturns.map((a) => (
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

      <Card>
        <CardHeader title="Rentabilidad mensual (últimos 12m)" />
        <CardBody><MonthlyBars data={monthlyReturns} height={260} /></CardBody>
      </Card>
    </div>
  );
}
