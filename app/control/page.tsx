import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { RunButton } from "@/components/agents/RunButton";
import { RefreshButton } from "@/components/market/RefreshButton";
import { RefreshNewsButton } from "@/components/market/RefreshNewsButton";
import { getKpis, getPositions } from "@/lib/data/portfolio";
import { getAlerts } from "@/lib/data/research";
import { fmtPct, pnlColor, severityColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ControlPage() {
  const [positions, alerts, kpis] = await Promise.all([
    getPositions(),
    getAlerts(),
    getKpis(),
  ]);
  const overweight = positions.filter(p => Math.abs(p.weight) > 8);
  const drawdowns = positions.filter(p => p.unrealizedPnlPct < -10);

  return (
    <div>
      <PageHeader
        title="Control Room"
        subtitle="Middle office · alertas, riesgo, drift y modelos desactualizados"
        action={
          <div className="flex gap-2 flex-wrap justify-end">
            <RefreshButton label="Refresh quotes" variant="primary" />
            <RefreshNewsButton label="Refresh news (IA)" />
            <RunButton skillId="valuation-reviewer" skillName="valuation-reviewer" label="Revisar valoraciones" />
            <RunButton skillId="morning-note" skillName="morning-note" label="Morning Note" />
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="p-3"><div className="text-2xs uppercase text-fg-muted">Alertas activas</div><div className="text-lg font-semibold mt-1">{alerts.length}</div></Card>
        <Card className="p-3"><div className="text-2xs uppercase text-fg-muted">Posiciones &gt; 8%</div><div className="text-lg font-semibold mt-1 text-warn">{overweight.length}</div></Card>
        <Card className="p-3"><div className="text-2xs uppercase text-fg-muted">Drawdowns &gt; 10%</div><div className="text-lg font-semibold mt-1 text-neg">{drawdowns.length}</div></Card>
        <Card className="p-3"><div className="text-2xs uppercase text-fg-muted">Tracking error</div><div className="text-lg font-semibold mt-1">{kpis.trackingErrorPct.toFixed(2)}%</div></Card>
      </div>

      <Card className="mb-4">
        <CardHeader title="Alertas" subtitle="Eventos que requieren atención" />
        <CardBody className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Severidad</TH><TH>Fecha</TH><TH>Ticker</TH><TH>Alerta</TH><TH>Acción sugerida</TH><TH></TH>
              </TR>
            </THead>
            <TBody>
              {alerts.map(a => (
                <TR key={a.id}>
                  <TD><span className={`inline-flex rounded border px-1.5 py-0.5 text-2xs uppercase font-medium ${severityColor(a.severity)}`}>{a.severity}</span></TD>
                  <TD className="numeric text-fg-muted">{a.date}</TD>
                  <TD>{a.ticker ? <Link className="text-accent hover:underline" href={`/companies/${encodeURIComponent(a.ticker)}`}>{a.ticker}</Link> : <span className="text-fg-subtle text-2xs">—</span>}</TD>
                  <TD>{a.title}</TD>
                  <TD className="text-fg-muted text-xs">{a.suggestedAction ?? "—"}</TD>
                  <TD align="right"><Button size="sm">Ejecutar</Button></TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Posiciones con peso elevado" subtitle="Peso absoluto > 8%" />
          <CardBody className="p-0">
            <Table>
              <THead>
                <TR><TH>Ticker</TH><TH align="right">Peso</TH><TH align="right">P/L</TH><TH>Tesis</TH></TR>
              </THead>
              <TBody>
                {overweight.map(p => (
                  <TR key={p.ticker}>
                    <TD><Link className="text-accent hover:underline font-medium" href={`/companies/${encodeURIComponent(p.ticker)}`}>{p.ticker}</Link></TD>
                    <TD numeric align="right">{p.weight.toFixed(1)}%</TD>
                    <TD numeric align="right" className={pnlColor(p.unrealizedPnlPct)}>{fmtPct(p.unrealizedPnlPct, 1)}</TD>
                    <TD><Badge tone={p.thesisStatus === "Activa" ? "pos" : p.thesisStatus === "En revisión" ? "warn" : "neg"}>{p.thesisStatus}</Badge></TD>
                  </TR>
                ))}
                {overweight.length === 0 && <TR><TD colSpan={4} className="text-fg-muted text-center py-4">Sin overweights</TD></TR>}
              </TBody>
            </Table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Drawdowns individuales" subtitle="Posiciones con P/L < -10%" />
          <CardBody className="p-0">
            <Table>
              <THead>
                <TR><TH>Ticker</TH><TH align="right">Peso</TH><TH align="right">P/L</TH><TH>Tesis</TH></TR>
              </THead>
              <TBody>
                {drawdowns.map(p => (
                  <TR key={p.ticker}>
                    <TD><Link className="text-accent hover:underline font-medium" href={`/companies/${encodeURIComponent(p.ticker)}`}>{p.ticker}</Link></TD>
                    <TD numeric align="right">{p.weight.toFixed(1)}%</TD>
                    <TD numeric align="right" className={pnlColor(p.unrealizedPnlPct)}>{fmtPct(p.unrealizedPnlPct, 1)}</TD>
                    <TD><Badge tone={p.thesisStatus === "Activa" ? "pos" : p.thesisStatus === "En revisión" ? "warn" : "neg"}>{p.thesisStatus}</Badge></TD>
                  </TR>
                ))}
                {drawdowns.length === 0 && <TR><TD colSpan={4} className="text-fg-muted text-center py-4">Sin drawdowns relevantes</TD></TR>}
              </TBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
