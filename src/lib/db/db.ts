import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  // Pobieramy pełny, prawidłowy URL (ten z końcówką .pooler.supabase.com:6543)
  const connectionString = process.env.POSTGRES_PRISMA_URL || "postgresql://localhost:5432";

  const pool = new pg.Pool({
    connectionString,
    // Trójstopniowe wymuszenie SSL akceptujące certyfikat Supabase
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false,
  });
  
  const adapter = new PrismaPg(pool);
  prismaInstance = new PrismaClient({ adapter });
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;