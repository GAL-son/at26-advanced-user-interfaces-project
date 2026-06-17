import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  let connectionString = process.env.POSTGRES_PRISMA_URL || "postgresql://localhost:5432";

  // Jeśli jesteśmy na produkcji/preview, wstrzykujemy parametry SSL wprost do adresu URL.
  // To ostatecznie eliminuje błąd "self-signed certificate in certificate chain".
  if (process.env.NODE_ENV === 'production' && connectionString.startsWith('postgres')) {
    const urlObj = new URL(connectionString);
    urlObj.searchParams.set('sslmode', 'require');
    urlObj.searchParams.set('uselibpqcompat', 'true');
    connectionString = urlObj.toString();
  }

  const pool = new pg.Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  
  const adapter = new PrismaPg(pool);
  prismaInstance = new PrismaClient({ adapter });
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;