import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { positions, companies, kpis } from "@/lib/mock-data";
import { fmtMoney, fmtNumber, fmtPct, pnlColor } from "@/lib/utils";

export default function PositionsPage() {
  const grossLong  = positions.filter(p => p.weight > 0).reduce((a, p) => a + p.weight, 0);
  const grossShort = positions.filter(p => p.weight < 0).reduce((a, p) => a + p.weight, 0);
  const net = grossLong + grossShort;

  return (
    <div>
      <PageHeader
        title="Posiciones"
        subtitle={`${positions.length} posiciones · Net ${net.toFixed(1)}% · Gross ${(grossLong - grossShort).toFixed(1)}% · Cash ${kpis.cashPct.toFixed(1)}%`}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="p-3">
          <div className="text-2xs uppercase text-fg-muted">Long exposure</div>
          <div className="text-lg font-semibold numeric mt-1">{grossLong.toFixed(1)}%</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xs uppercase text-fg-muted">Short exposure</div>
          <div className="text-lg font-semibold numeric text-neg mt-1">{grossShort.toFixed(1)}%</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xs uppercase text-fg-muted">Concentración top 5</div>
          <div className="text-lg font-semibold numeric mt-1">{positions.slice().sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight)).slice(0, 5).reduce((a, p) => a + Math.abs(p.weight), 0).toFixed(1)}%</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xs uppercase text-fg-muted">Drawdown actual</div>
          <div className="text-lg font-semibold numeric text-neg mt-1">{fmtPct(kpis.currentDrawdownPct, 1)}</div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Cartera detallada" subtitle="Pondereado por valor de mercado · datos mock" />
        <CardBody className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Ticker</TH>
                <TH>Empresa</TH>
                <TH>Sector</TH>
                <TH>País</TH>
                <TH align="right">Cant.</TH>
                <TH align="right">Coste medio</TH>
                <TH align="right">Precio</TH>
                <TH align="right">Valor</TH>
                <TH align="right">P/L</TH>
                <TH align="right">P/L %</TH>
                <TH align="right">Peso</TH>
                <TH>Convicción</TH>
                <TH>Tesis</TH>
              </TR>
            </THead>
            <TBody>
              {positions.map((p) => {
                const c = companies.find(x => x.ticker === p.ticker);
                return (
                  <TR key={p.ticker}>
                    <TD>
                      <Link className="text-accent hover:underline font-medium" href={`/companies/${encodeURIComponent(p.ticker)}`}>{p.ticker}</Link>
                    </TD>
                    <TD className="text-fg">{c?.name ?? "—"}</TD>
                    <TD className="text-fg-muted text-xs">{c?.sector}</TD>
                    <TD className="text-fg-muted text-xs">{c?.country}</TD>
                    <TD numeric align="right">{fmtNumber(p.quantity, 0)}</TD>
                    <TD numeric align="right">{fmtNumber(p.averageCost)}</TD>
                    <TD numeric align="right">{fmtNumber(p.currentPrice)}</TD>
                    <TD numeric align="right">{fmtMoney(p.marketValue)}</TD>
                    <TD numeric align="right" className={pnlColor(p.unrealizedPnl)}>{fmtMoney(p.unrealizedPnl)}</TD>
                    <TD numeric align="right" className={pnlColor(p.unrealizedPnlPct)}>{fmtPct(p.unrealizedPnlPct, 1)}</TD>
                    <TD numeric align="right">{p.weight.toFixed(1)}%</TD>
                    <TD>
                      <Badge tone={p.conviction === "Alta" ? "pos" : p.conviction === "Media" ? "warn" : "muted"}>{p.conviction}</Badge>
                    </TD>
                    <TD>
                      <Badge tone={p.thesisStatus === "Activa" ? "pos" : p.thesisStatus === "En revisión" ? "warn" : "neg"}>
                        {p.thesisStatus}
                      </Badge>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
