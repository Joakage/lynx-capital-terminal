import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RunButton } from "@/components/agents/RunButton";
import { getSectors } from "@/lib/data/research";

export const dynamic = "force-dynamic";

export default async function SectorsPage() {
  const sectors = await getSectors();
  return (
    <div>
      <PageHeader
        title="Sector Library"
        subtitle="Biblioteca interna · drivers, riesgos y comps por sector"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sectors.map((s) => (
          <Card key={s.id}>
            <CardHeader
              title={s.name}
              subtitle={`Market size ~ US$${s.marketSizeUsdBn.toLocaleString("es-ES")} bn · Fwd P/E ${s.avgFwdPE.toFixed(1)}x`}
            />
            <CardBody className="space-y-3">
              <div>
                <div className="text-2xs uppercase text-fg-muted mb-1">Drivers</div>
                <div className="flex flex-wrap gap-1">
                  {s.drivers.map(d => <Badge key={d} tone="pos">{d}</Badge>)}
                </div>
              </div>
              <div>
                <div className="text-2xs uppercase text-fg-muted mb-1">Riesgos</div>
                <div className="flex flex-wrap gap-1">
                  {s.risks.map(r => <Badge key={r} tone="neg">{r}</Badge>)}
                </div>
              </div>
              <div>
                <div className="text-2xs uppercase text-fg-muted mb-1">Top comps</div>
                <div className="flex flex-wrap gap-1">
                  {s.topCompanies.map(c => <Badge key={c} tone="muted">{c}</Badge>)}
                </div>
              </div>
              <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-3 text-2xs text-fg-muted">
                <div className="flex items-center gap-2">
                  <span>{s.ideasLong} Long</span>
                  <span>·</span>
                  <span>{s.ideasShort} Short</span>
                </div>
                <RunButton
                  skillId="idea-generation"
                  skillName="idea-generation"
                  label="Buscar ideas"
                  sector={s.name}
                  variant="secondary"
                />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
