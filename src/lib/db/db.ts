import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function stripSslParams(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    url.searchParams.delete('sslmode');
    url.searchParams.delete('uselibpqcompat');
    return url.toString();
  } catch {
    return connectionString;
  }
}

function createPrismaClient(): PrismaClient {
  const isProduction = process.env.NODE_ENV === 'production';

  const rawUrl = isProduction
    ? (process.env.POSTGRES_PRISMA_URL ?? '')   // ✅ masz tę zmienną
    : (process.env.POSTGRES_PRISMA_URL ?? 'postgresql://localhost:5432');

  const connectionString = stripSslParams(rawUrl);

  const pool = new pg.Pool({
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    max: 1,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;