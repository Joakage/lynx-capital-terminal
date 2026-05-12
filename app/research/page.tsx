import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { getIdeaPipeline, getWatchlist, getResearchQueue } from "@/lib/data/research";
import { fmtPct, pnlColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

const pipelineStatusOrder = ["Idea bruta", "En research", "Modelada", "Memo pendiente", "Aprobada", "En cartera", "Watchlist", "Rechazada"] as const;

export default async function ResearchPage() {
  const [ideaPipeline, watchlist, researchQueue] = await Promise.all([
    getIdeaPipeline(),
    getWatchlist(),
    getResearchQueue(),
  ]);
  const sortedIdeas = [...ideaPipeline].sort(
    (a, b) => pipelineStatusOrder.indexOf(a.status) - pipelineStatusOrder.indexOf(b.status),
  );
  const sortedWatchlist = [...watchlist].sort((a, b) => b.score - a.score);

  return (
    <div>
      <PageHeader
        title="Ideas & Watchlist"
        subtitle="Pipeline de research · scoring automático"
        action={<Button variant="primary" size="sm">+ Nueva idea</Button>}
      />

      <Card className="mb-4">
        <CardHeader
          title="Pipeline de ideas"
          subtitle={`${ideaPipeline.length} ideas en seguimiento`}
        />
        <CardBody className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Ticker</TH>
                <TH>Nombre</TH>
                <TH>Side</TH>
                <TH>Sector</TH>
                <TH>Estado</TH>
                <TH>Convicción</TH>
                <TH>Próximo paso</TH>
              </TR>
            </THead>
            <TBody>
              {sortedIdeas.map((i) => (
                <TR key={i.id}>
                  <TD>
                    <Link href={`/companies/${encodeURIComponent(i.ticker)}`} className="text-accent hover:underline font-medium">{i.ticker}</Link>
                  </TD>
                  <TD>{i.name}</TD>
                  <TD><Badge tone={i.side === "Long" ? "pos" : "neg"}>{i.side}</Badge></TD>
                  <TD className="text-fg-muted text-xs">{i.sector}</TD>
                  <TD><Badge tone={i.status === "En cartera" ? "pos" : i.status === "Rechazada" ? "neg" : "muted"}>{i.status}</Badge></TD>
                  <TD><Badge tone={i.conviction === "Alta" ? "pos" : i.conviction === "Media" ? "warn" : "muted"}>{i.conviction}</Badge></TD>
                  <TD className="text-fg-muted text-xs">{i.nextStep}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Watchlist" subtitle="Score ponderado: upside × calidad × catalizadores − riesgo" />
          <CardBody className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Ticker</TH>
                  <TH>Nombre</TH>
                  <TH align="right">Fair value</TH>
                  <TH align="right">Precio</TH>
                  <TH align="right">Upside</TH>
                  <TH align="right">Calidad</TH>
                  <TH align="right">Riesgo</TH>
                  <TH>Catalizador</TH>
                  <TH align="right">Score</TH>
                </TR>
              </THead>
              <TBody>
                {sortedWatchlist.map((w) => (
                  <TR key={w.ticker}>
                    <TD><Link className="text-accent hover:underline font-medium" href={`/companies/${encodeURIComponent(w.ticker)}`}>{w.ticker}</Link></TD>
                    <TD>{w.name}</TD>
                    <TD numeric align="right">{w.fairValue}</TD>
                    <TD numeric align="right">{w.price}</TD>
                    <TD numeric align="right" className={pnlColor(w.upsidePct)}>{fmtPct(w.upsidePct, 1)}</TD>
                    <TD numeric align="right">{w.qualityScore}/10</TD>
                    <TD numeric align="right">{w.riskScore}/10</TD>
                    <TD className="text-fg-muted text-xs">{w.catalyst}</TD>
                    <TD numeric align="right" className="font-semibold">{w.score.toFixed(1)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Research Queue" subtitle="Próximo paso priorizado" />
          <CardBody className="space-y-2">
            {researchQueue.map(r => (
              <div key={r.id} className="flex items-start gap-2 text-sm border-b border-border-subtle pb-2 last:border-b-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Badge tone={r.priority === "Alta" ? "neg" : r.priority === "Media" ? "warn" : "muted"}>{r.priority}</Badge>
                    <span className="text-2xs text-fg-muted">{r.status}</span>
                  </div>
                  <div className="mt-1">
                    {r.task} {r.ticker && <Link href={`/companies/${encodeURIComponent(r.ticker)}`} className="text-accent hover:underline">{r.ticker}</Link>}
                  </div>
                  <code className="text-2xs text-fg-muted">{r.skill}</code>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
