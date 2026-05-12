import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ExposurePie } from "@/components/charts/ExposurePie";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import {
  positions, companies, sectorExposure, regionExposure, marketCapExposure, currencyExposure,
} from "@/lib/mock-data";
import { fmtPct, pnlColor } from "@/lib/utils";

const benchmarkSectorWeights: Record<string, number> = {
  "Technology": 30,
  "Consumer Discretionary": 14,
  "Financials": 13,
  "Healthcare": 12,
  "Consumer Staples": 6,
  "Industrials": 9,
  "Energy": 4,
  "Communication Services": 7,
  "Utilities": 3,
  "Materials": 2,
};

export default function ExposuresPage() {
  const sect = sectorExposure();
  const reg = regionExposure();
  const mc = marketCapExposure();
  const cur = currencyExposure();

  // Style exposure
  const styleMap = new Map<string, number>();
  for (const p of positions) {
    const c = companies.find(x => x.ticker === p.ticker);
    if (!c) continue;
    styleMap.set(c.style, (styleMap.get(c.style) ?? 0) + p.weight);
  }
  const styleExp = Array.from(styleMap.entries()).map(([style, weight]) => ({ style, weight: +weight.toFixed(2) }));

  return (
    <div>
      <PageHeader title="Exposiciones" subtitle="Cortes por sector, región, market cap, divisa y estilo" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader title="Sectorial vs benchmark" />
          <CardBody className="p-0">
            <Table>
              <THead>
                <TR><TH>Sector</TH><TH align="right">Cartera</TH><TH align="right">Benchmark</TH><TH align="right">Over/Under</TH></TR>
              </THead>
              <TBody>
                {sect.map(s => {
                  const b = benchmarkSectorWeights[s.sector] ?? 0;
                  return (
                    <TR key={s.sector}>
                      <TD>{s.sector}</TD>
                      <TD numeric align="right">{s.weight.toFixed(1)}%</TD>
                      <TD numeric align="right" className="text-fg-muted">{b.toFixed(1)}%</TD>
                      <TD numeric align="right" className={pnlColor(s.weight - b)}>{fmtPct(s.weight - b, 1)}</TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Distribución sectorial" />
          <CardBody><ExposurePie data={sect} labelKey="sector" height={280} /></CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader title="Geográfica" />
          <CardBody><ExposurePie data={reg} labelKey="region" /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Market cap" />
          <CardBody><ExposurePie data={mc} labelKey="bucket" /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Divisa" />
          <CardBody><ExposurePie data={cur} labelKey="currency" /></CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Por estilo" subtitle="Compounder / Deep Value / Special Situation / Turnaround / ..." />
        <CardBody className="p-0">
          <Table>
            <THead>
              <TR><TH>Estilo</TH><TH align="right">Peso</TH></TR>
            </THead>
            <TBody>
              {styleExp.sort((a, b) => b.weight - a.weight).map(s => (
                <TR key={s.style}>
                  <TD>{s.style}</TD>
                  <TD numeric align="right">{s.weight.toFixed(1)}%</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
