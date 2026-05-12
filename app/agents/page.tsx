import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { agentSkills, agentRuns } from "@/lib/mock-data";

const areas = ["Análisis", "Control", "Reporting", "Desarrollo de negocio", "Private Equity / M&A"] as const;
const areaTone: Record<string, "pos" | "info" | "warn" | "accent" | "muted"> = {
  "Análisis": "info",
  "Control": "warn",
  "Reporting": "pos",
  "Desarrollo de negocio": "accent",
  "Private Equity / M&A": "muted",
};

export default function AgentsPage() {
  return (
    <div>
      <PageHeader
        title="Claude Agents"
        subtitle="Catálogo de skills · IA contextualizada con tu cartera, modelos, tesis y calendario"
      />

      <Card className="mb-4">
        <CardHeader title="¿Cómo funciona?" />
        <CardBody className="text-sm text-fg-muted space-y-2">
          <p>
            Cada skill recibe contexto automático de la plataforma — ticker, posición, modelo activo, tesis,
            últimas noticias, próximos eventos, consenso, benchmark y NAV — y devuelve un artefacto
            (informe, modelo, deck, memo, scorecard) que queda guardado en la ficha de empresa o en Reporting.
          </p>
          <p>
            En la ficha de cada empresa, los botones lanzan el skill apropiado con todo el contexto pre-cargado.
            Aquí puedes ver el catálogo completo y los últimos runs ejecutados.
          </p>
        </CardBody>
      </Card>

      {areas.map(area => {
        const skills = agentSkills.filter(s => s.area === area);
        if (skills.length === 0) return null;
        return (
          <div key={area} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-sm font-semibold tracking-tight">{area}</h2>
              <Badge tone={areaTone[area]}>{skills.length} skills</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {skills.map(s => (
                <div key={s.id} id={s.id} className="rounded-lg border border-border bg-bg-panel p-3 hover:border-border/80 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <code className="text-2xs text-accent">{s.name}</code>
                    <Badge tone="muted">{s.output}</Badge>
                  </div>
                  <p className="text-sm text-fg leading-snug">{s.description}</p>
                  <div className="flex justify-end mt-3">
                    <Button size="sm" variant="primary">{s.buttonLabel}</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <Card>
        <CardHeader title="Últimos runs" subtitle="Histórico de ejecuciones · queda guardado en la ficha correspondiente" />
        <CardBody className="p-0">
          <Table>
            <THead>
              <TR><TH>Fecha</TH><TH>Agente</TH><TH>Ticker</TH><TH>Estado</TH><TH>Resumen</TH></TR>
            </THead>
            <TBody>
              {agentRuns.map(r => (
                <TR key={r.id}>
                  <TD className="numeric text-fg-muted">{r.date}</TD>
                  <TD><code className="text-2xs text-accent">{r.agentName}</code></TD>
                  <TD>{r.ticker ?? "—"}</TD>
                  <TD><Badge tone={r.status === "Completado" ? "pos" : r.status === "Error" ? "neg" : "warn"}>{r.status}</Badge></TD>
                  <TD className="text-fg-muted text-xs">{r.outputSummary}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
