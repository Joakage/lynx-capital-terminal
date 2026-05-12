import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { calendarEvents, positions, alerts } from "@/lib/mock-data";
import { severityColor } from "@/lib/utils";

const portfolioTickers = new Set(positions.map(p => p.ticker));

const typeTone: Record<string, "pos" | "neg" | "warn" | "info" | "muted" | "accent" | "default"> = {
  Earnings: "warn",
  Macro: "info",
  "Investor Day": "accent",
  Dividend: "muted",
  Conference: "muted",
  Filing: "muted",
  Internal: "muted",
};

export default function CalendarPage() {
  const today = "2026-05-12";
  const upcoming = calendarEvents
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const inPortfolio = upcoming.filter(e => e.ticker && portfolioTickers.has(e.ticker));
  const macro = upcoming.filter(e => !e.ticker);

  return (
    <div>
      <PageHeader
        title="Calendario"
        subtitle="Macro · earnings · investor days · catalizadores"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Próximos eventos" subtitle={`${upcoming.length} eventos`} />
          <CardBody className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Fecha</TH><TH>Evento</TH><TH>Ticker</TH><TH>Tipo</TH><TH>Importancia</TH><TH>Notas</TH>
                </TR>
              </THead>
              <TBody>
                {upcoming.map(e => (
                  <TR key={e.id}>
                    <TD className="numeric text-fg-muted">{e.date}</TD>
                    <TD className="font-medium">{e.title}</TD>
                    <TD>
                      {e.ticker
                        ? <Link className="text-accent hover:underline" href={`/companies/${encodeURIComponent(e.ticker)}`}>{e.ticker}</Link>
                        : <span className="text-fg-subtle text-2xs">macro</span>}
                    </TD>
                    <TD><Badge tone={typeTone[e.type] ?? "muted"}>{e.type}</Badge></TD>
                    <TD><Badge tone={e.importance === "Alta" ? "neg" : e.importance === "Media" ? "warn" : "muted"}>{e.importance}</Badge></TD>
                    <TD className="text-fg-muted text-xs">{e.notes ?? "—"}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Alertas activas" />
          <CardBody className="space-y-2">
            {alerts.map(a => (
              <div key={a.id} className="flex items-start gap-2 text-sm border-b border-border-subtle pb-2 last:border-b-0 last:pb-0">
                <span className={`inline-flex shrink-0 rounded border px-1.5 py-0.5 text-2xs uppercase font-medium ${severityColor(a.severity)}`}>{a.severity}</span>
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
          <CardHeader title="Solo cartera" subtitle="Eventos que afectan tus posiciones" />
          <CardBody className="p-0">
            <Table>
              <THead>
                <TR><TH>Fecha</TH><TH>Empresa</TH><TH>Evento</TH><TH>Importancia</TH></TR>
              </THead>
              <TBody>
                {inPortfolio.map(e => (
                  <TR key={e.id}>
                    <TD className="numeric text-fg-muted">{e.date}</TD>
                    <TD><Link className="text-accent hover:underline" href={`/companies/${encodeURIComponent(e.ticker!)}`}>{e.ticker}</Link></TD>
                    <TD>{e.title}</TD>
                    <TD><Badge tone={e.importance === "Alta" ? "neg" : e.importance === "Media" ? "warn" : "muted"}>{e.importance}</Badge></TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Macro" subtitle="CPI / PCE / FOMC / ECB" />
          <CardBody className="p-0">
            <Table>
              <THead>
                <TR><TH>Fecha</TH><TH>Evento</TH><TH>Importancia</TH></TR>
              </THead>
              <TBody>
                {macro.map(e => (
                  <TR key={e.id}>
                    <TD className="numeric text-fg-muted">{e.date}</TD>
                    <TD>{e.title}</TD>
                    <TD><Badge tone={e.importance === "Alta" ? "neg" : e.importance === "Media" ? "warn" : "muted"}>{e.importance}</Badge></TD>
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
