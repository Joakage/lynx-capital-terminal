import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { getCompanies } from "@/lib/data/companies";
import { getPositions } from "@/lib/data/portfolio";
import { getTheses } from "@/lib/data/research";
import { fmtPct, pnlColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const [companies, positions, theses] = await Promise.all([
    getCompanies(),
    getPositions(),
    getTheses(),
  ]);
  const posByTicker = new Map(positions.map((p) => [p.ticker, p]));
  const thesisByTicker = new Map(theses.map((t) => [t.ticker, t]));

  return (
    <div>
      <PageHeader
        title="Empresas"
        subtitle="Universo cubierto · cartera + watchlist"
        action={
          <input
            type="search"
            placeholder="Buscar ticker o empresa…"
            className="rounded-md border border-border bg-bg-elevated text-sm px-3 py-1.5 placeholder:text-fg-subtle focus:outline-none focus:ring-1 focus:ring-accent/40"
            disabled
          />
        }
      />
      <Card>
        <CardHeader title={`${companies.length} compañías`} subtitle="Click en ticker para abrir ficha completa" />
        <CardBody className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Ticker</TH>
                <TH>Nombre</TH>
                <TH>Sector</TH>
                <TH>País</TH>
                <TH>Estilo</TH>
                <TH>Market cap</TH>
                <TH align="right">Mkt cap (US$bn)</TH>
                <TH align="right">En cartera</TH>
                <TH>Tesis</TH>
              </TR>
            </THead>
            <TBody>
              {companies.map((c) => {
                const pos = posByTicker.get(c.ticker);
                const thesis = thesisByTicker.get(c.ticker);
                return (
                  <TR key={c.ticker}>
                    <TD>
                      <Link href={`/companies/${encodeURIComponent(c.ticker)}`} className="text-accent hover:underline font-medium">{c.ticker}</Link>
                    </TD>
                    <TD>{c.name}</TD>
                    <TD className="text-fg-muted text-xs">{c.sector}</TD>
                    <TD className="text-fg-muted text-xs">{c.country}</TD>
                    <TD><Badge tone="muted">{c.style}</Badge></TD>
                    <TD className="text-fg-muted text-xs">{c.marketCapBucket}</TD>
                    <TD numeric align="right">{c.marketCapUsdBn.toLocaleString("es-ES")}</TD>
                    <TD numeric align="right" className={pos ? pnlColor(pos.unrealizedPnlPct) : "text-fg-subtle"}>
                      {pos ? `${pos.weight.toFixed(1)}% · ${fmtPct(pos.unrealizedPnlPct, 1)}` : "—"}
                    </TD>
                    <TD>
                      {thesis
                        ? <Badge tone={thesis.status === "Activa" ? "pos" : thesis.status === "En revisión" ? "warn" : "neg"}>{thesis.status}</Badge>
                        : <span className="text-fg-subtle text-2xs">—</span>}
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
