import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  // Budujemy connection string ręcznie z Twoich jawnych kluczy, dodając na końcu parametry wyłączające sprawdzanie SSL,
  // co omija błąd biblioteki pg i błąd self-signed certificate.
  const connectionString = process.env.NODE_ENV === 'production'
    ? `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/postgres?sslmode=require&uselibpqcompat=true`
    : process.env.POSTGRES_PRISMA_URL || "postgresql://localhost:5432";

  const pool = new pg.Pool({
    connectionString,
    // Dodatkowe potrójne zabezpieczenie w obiekcie dla starszych/nowszych wersji pg
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false
  });
  
  const adapter = new PrismaPg(pool);
  
  prismaInstance = new PrismaClient({ adapter });
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;