import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  // Czytamy dokładną nazwę klucza, który masz na Vercelu
  const connectionString = process.env.POSTGRES_PRISMA_URL;

  if (!connectionString && process.env.NODE_ENV === 'production') {
    console.error("🚨 CRITICAL ERROR: Brak klucza POSTGRES_PRISMA_URL na produkcji!");
  }

  const pool = new pg.Pool({ 
    connectionString: connectionString,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false
  });
  
  const adapter = new PrismaPg(pool);
  
  prismaInstance = new PrismaClient({ adapter });
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;