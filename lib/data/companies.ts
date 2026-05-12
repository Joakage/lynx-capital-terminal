import { prisma, hasDatabase } from "@/lib/db";
import * as mock from "@/lib/mock-data";
import type { Company } from "@/lib/types";

function rowToCompany(r: Awaited<ReturnType<typeof prisma.company.findFirst>>): Company | undefined {
  if (!r) return undefined;
  return {
    ticker: r.ticker,
    name: r.name,
    country: r.country,
    region: r.region as Company["region"],
    sector: r.sector,
    subsector: r.subsector,
    currency: r.currency as Company["currency"],
    marketCapBucket: r.marketCapBucket as Company["marketCapBucket"],
    marketCapUsdBn: r.marketCapUsdBn,
    description: r.description,
    style: r.style as Company["style"],
  };
}

export async function getCompanies(): Promise<Company[]> {
  if (!hasDatabase()) return mock.companies;
  const rows = await prisma.company.findMany({ orderBy: { ticker: "asc" } });
  if (rows.length === 0) return mock.companies;
  return rows.map((r) => rowToCompany(r)!);
}

export async function getCompany(ticker: string): Promise<Company | undefined> {
  if (!hasDatabase()) return mock.getCompany(ticker);
  const r = await prisma.company.findUnique({ where: { ticker } });
  return rowToCompany(r) ?? mock.getCompany(ticker);
}
