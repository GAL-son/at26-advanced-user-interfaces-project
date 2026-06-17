import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  // Tworzymy klasyczną pulę połączeń pg przy użyciu zmiennej z Vercela
  const pool = new pg.Pool({ connectionString: process.env.POSTGRES_URL });
  
  // Mapujemy ją na adapter akceptowany przez Prisma 7
  const adapter = new PrismaPg(pool);
  
  // Przekazujemy adapter bezpośrednio do opcji klienta
  prismaInstance = new PrismaClient({ adapter });
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;