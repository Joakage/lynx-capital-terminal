import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { getTransactions } from "@/lib/data/portfolio";
import { fmtNumber, fmtMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const transactions = await getTransactions();
  const totalFees = transactions.reduce((a, t) => a + t.fees, 0);
  return (
    <div>
      <PageHeader
        title="Operaciones"
        subtitle={`${transactions.length} operaciones · Comisiones totales ${fmtMoney(totalFees, "EUR")}`}
      />
      <Card>
        <CardHeader title="Histórico" subtitle="Compras, ventas, dividendos, comisiones, FX" />
        <CardBody className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Fecha</TH>
                <TH>Tipo</TH>
                <TH>Ticker</TH>
                <TH>Operación</TH>
                <TH align="right">Cantidad</TH>
                <TH align="right">Precio</TH>
                <TH align="right">Comisión</TH>
                <TH>Divisa</TH>
                <TH>Motivo / Tesis</TH>
              </TR>
            </THead>
            <TBody>
              {transactions.map((t) => (
                <TR key={t.id}>
                  <TD className="numeric text-fg-muted">{t.date}</TD>
                  <TD><Badge tone="muted">{t.type}</Badge></TD>
                  <TD>
                    <Link href={`/companies/${encodeURIComponent(t.ticker)}`} className="text-accent hover:underline">{t.ticker}</Link>
                  </TD>
                  <TD>
                    <Badge tone={t.side === "Compra" ? "pos" : t.side === "Venta" ? "neg" : "info"}>{t.side}</Badge>
                  </TD>
                  <TD numeric align="right">{fmtNumber(t.quantity, 0)}</TD>
                  <TD numeric align="right">{fmtNumber(t.price, 2)}</TD>
                  <TD numeric align="right">{fmtNumber(t.fees, 2)}</TD>
                  <TD className="text-fg-muted text-xs">{t.currency}</TD>
                  <TD className="text-fg-muted text-xs max-w-md truncate" title={t.rationale}>
                    {t.rationale ?? "—"} {t.thesisId && <code className="ml-1 text-fg-subtle text-2xs">{t.thesisId}</code>}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
