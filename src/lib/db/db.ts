import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Usuwa parametry SSL z connection stringa, żeby nie kolidowały
 * z konfiguracją ssl w pg.Pool — która ma pierwszeństwo.
 */
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

  // Używaj zmiennych generowanych przez integrację Vercel ↔ Supabase,
  // a nie ręcznie sklejanych z HOST/USER/PASSWORD
  const rawUrl = isProduction
    ? (process.env.POSTGRES_PRISMA_URL ?? process.env.POSTGRES_URL ?? '')
    : (process.env.POSTGRES_PRISMA_URL ?? 'postgresql://localhost:5432');

  const connectionString = stripSslParams(rawUrl);

  const pool = new pg.Pool({
    connectionString,
    ssl: isProduction
      ? { rejectUnauthorized: false }  // akceptuje self-signed cert Supabase
      : false,
    max: 1, // krytyczne dla Vercel serverless + pgBouncer (transaction mode)
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

// Buforuj instancję — działa zarówno w dev jak i w ciepłych lambdach Vercel
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;