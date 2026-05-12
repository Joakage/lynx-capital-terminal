import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __lynxPrisma: PrismaClient | undefined;
}

function buildClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["warn", "error"],
  });
}

/**
 * Singleton Prisma client. Survives HMR in development.
 * Only instantiate when DATABASE_URL is set — callers MUST check
 * `hasDatabase()` first (or use the helpers in `lib/data/*`).
 */
export const prisma: PrismaClient =
  globalThis.__lynxPrisma ?? (globalThis.__lynxPrisma = buildClient());

export function hasDatabase(): boolean {
  return !!process.env.DATABASE_URL;
}

/**
 * Cached lookup of the "default" portfolio for this workspace.
 * In multi-portfolio mode this would take a portfolioId arg; for the
 * single-fund MVP we just return the first portfolio in the DB.
 */
let cachedPortfolioId: string | null = null;
export async function getDefaultPortfolioId(): Promise<string | null> {
  if (!hasDatabase()) return null;
  if (cachedPortfolioId) return cachedPortfolioId;
  const p = await prisma.portfolio.findFirst({ orderBy: { createdAt: "asc" } });
  if (!p) return null;
  cachedPortfolioId = p.id;
  return p.id;
}
