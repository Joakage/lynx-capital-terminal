import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { agentSkills } from "@/lib/mock-data";
import { RUNNABLE_SKILL_IDS } from "@/lib/anthropic/skills";
import { SkillCard } from "@/components/agents/SkillCard";
import { RunButton } from "@/components/agents/RunButton";
import { listRuns } from "@/lib/storage/agent-runs";

const areas = ["Análisis", "Control", "Reporting", "Desarrollo de negocio", "Private Equity / M&A"] as const;
const areaTone: Record<string, "pos" | "info" | "warn" | "accent" | "muted"> = {
  "Análisis": "info",
  "Control": "warn",
  "Reporting": "pos",
  "Desarrollo de negocio": "accent",
  "Private Equity / M&A": "muted",
};

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const runnable = new Set(RUNNABLE_SKILL_IDS);
  const recentRuns = await listRuns(20);

  return (
    <div>
      <PageHeader
        title="Claude Agents"
        subtitle="Catálogo de skills · IA contextualizada con tu cartera, modelos, tesis y calendario"
        action={
          <div className="flex gap-2">
            <RunButton skillId="morning-note" skillName="morning-note" label="Morning Note" variant="primary" />
            <RunButton skillId="valuation-reviewer" skillName="valuation-reviewer" label="Revisar valoraciones" />
          </div>
        }
      />

      <Card className="mb-4">
        <CardHeader title="¿Cómo funciona?" />
        <CardBody className="text-sm text-fg-muted space-y-2">
          <p>
            Cada skill recibe contexto automático de la plataforma — posiciones, modelos activos, tesis,
            últimas noticias, próximos eventos, benchmark y NAV — vía un prompt cacheado (Anthropic prompt caching).
            El runner llama a Claude (<code className="text-accent">claude-opus-4-7</code> con adaptive thinking),
            persiste el run en <code>data/agent-runs/</code> y devuelve markdown listo para revisar o descargar.
          </p>
          <p className="text-2xs">
            <strong className="text-fg">Setup:</strong> añade <code>ANTHROPIC_API_KEY</code> a <code>.env.local</code>.
            Los skills marcados <span className="text-accent">activos</span> ejecutan contra la API real;
            el resto del catálogo está definido y queda pendiente de implementación.
          </p>
        </CardBody>
      </Card>

      {areas.map(area => {
        const skills = agentSkills.filter(s => s.area === area);
        if (skills.length === 0) return null;
        const activeCount = skills.filter(s => runnable.has(s.id)).length;
        return (
          <div key={area} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-sm font-semibold tracking-tight">{area}</h2>
              <Badge tone={areaTone[area]}>{skills.length} skills</Badge>
              {activeCount > 0 && <Badge tone="pos">{activeCount} activas</Badge>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {skills.map(s => (
                <SkillCard
                  key={s.id}
                  id={s.id}
                  name={s.name}
                  description={s.description}
                  buttonLabel={s.buttonLabel}
                  output={s.output}
                  runnable={runnable.has(s.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      <Card>
        <CardHeader title="Últimos runs" subtitle="Histórico de ejecuciones · persiste en data/agent-runs/" />
        <CardBody className="p-0">
          {recentRuns.length === 0 ? (
            <div className="p-6 text-sm text-fg-muted text-center">
              No hay runs todavía. Ejecuta tu primera skill (configura <code>ANTHROPIC_API_KEY</code> primero).
            </div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Fecha</TH>
                  <TH>Agente</TH>
                  <TH>Ticker</TH>
                  <TH>Estado</TH>
                  <TH align="right">Tokens (in / out / cache R)</TH>
                  <TH align="right">Latencia</TH>
                  <TH>Resumen</TH>
                </TR>
              </THead>
              <TBody>
                {recentRuns.map(r => (
                  <TR key={r.id}>
                    <TD className="numeric text-fg-muted text-xs">{r.startedAt.replace("T", " ").slice(0, 16)}</TD>
                    <TD><code className="text-2xs text-accent">{r.skillName}</code></TD>
                    <TD>{r.ticker ?? "—"}</TD>
                    <TD><Badge tone={r.status === "Completado" ? "pos" : "neg"}>{r.status}</Badge></TD>
                    <TD numeric align="right" className="text-2xs text-fg-muted">
                      {r.usage.inputTokens} / {r.usage.outputTokens} / {r.usage.cacheReadInputTokens}
                    </TD>
                    <TD numeric align="right" className="text-2xs text-fg-muted">{(r.elapsedMs / 1000).toFixed(1)}s</TD>
                    <TD className="text-fg-muted text-xs max-w-md truncate" title={r.output.slice(0, 400)}>
                      {r.output.slice(0, 120)}…
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
