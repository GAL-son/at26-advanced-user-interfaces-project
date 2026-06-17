import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  let pool: pg.Pool;

  if (process.env.NODE_ENV === 'production') {
    pool = new pg.Pool({
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: "postgres", 
      port: 5432,
      ssl: { rejectUnauthorized: false },
    });
  } else {
    pool = new pg.Pool({
      connectionString: process.env.POSTGRES_PRISMA_URL || "postgresql://localhost:5432",
    });
  }
  
  const adapter = new PrismaPg(pool);
  prismaInstance = new PrismaClient({ adapter });
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;