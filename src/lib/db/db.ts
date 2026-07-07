import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  // 1. Sprawdzamy czy jesteśmy w środowisku deweloperskim
  const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

  if (isDev) {
    // 1. Konfiguracja Driver Adaptera dla SQLite (Lokalnie / Dev)
    const sqliteUrl = process.env.SQLITE_DB_URL || "file:./dev.db"; // Prisma SQLite wymaga przedrostka "file:"
    
    // ROZWIĄZANIE: Przekazujemy tylko adres URL, bez ręcznego tworzenia instancji bazy danych
    const adapter = new PrismaBetterSqlite3({
      url: sqliteUrl,
    });
    
    // Przekazujemy adapter do konstruktora
    prismaInstance = new PrismaClient({ adapter });
  } else {
    // Konfiguracja dla PostgreSQL na produkcji
    let connectionString = process.env.POSTGRES_PRISMA_URL || "postgresql://localhost:5432";

    // Sprawdzamy czy adres wskazuje na Supabase
    const isSupabase = connectionString.includes('supabase.co') || connectionString.includes('pooler.supabase.com');

    if (connectionString.startsWith('postgres')) {
      const urlObj = new URL(connectionString);
      urlObj.searchParams.set('sslmode', 'require');
      urlObj.searchParams.set('uselibpqcompat', 'true');
      connectionString = urlObj.toString();
    }

    const pool = new pg.Pool({
      connectionString,
      // Akceptujemy samopodpisane certyfikaty na produkcji ORAZ przy lokalnym połączeniu z Supabase
      ssl: isSupabase ? { rejectUnauthorized: false } : false,
    });

    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({ adapter });
  }
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;