import { prisma } from '@/lib/db/db';
import { Prisma } from '@prisma/client';

export interface TickerDriver {
  guid: string;
  name: string;
  elo: number;
  combo: number;
  lastActive: string;
}

export interface ExtendedDriver {
  guid: string;
  mainName: string;
  altNames: string | null;
  currentElo: number;
  combo: number;
  racesCount: number;
  position: number;
  lastRaced: string | null;
}

interface GetDriversParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
}

export async function getDriversList({
  page = 0,
  limit = 20,
  search = '',
  sortBy = 'elo'
}: GetDriversParams = {}): Promise<{ drivers: ExtendedDriver[]; hasMore: boolean }> {

  const offset = page * limit;

  // Dynamiczne budowanie warunku wyszukiwania
  const where: Prisma.DriverWhereInput = search
    ? {
      OR: [
        { mainName: { contains: search } },
        { altNames: { contains: search } }
      ]
    }
    : {};

  // Definiowanie sortowania
  let orderBy: Prisma.DriverOrderByWithRelationInput;
  if (sortBy === 'name') {
    orderBy = { mainName: 'asc' };
  } else if (sortBy === 'races') {
    orderBy = { raceResult: { _count: 'desc' } };
  } else if (sortBy === 'combo') {
    orderBy = { combo: 'desc' };
  } else {
    orderBy = { currentElo: 'desc' };
  }

  // Pobieramy kierowców
  const drivers = await prisma.driver.findMany({
    where,
    orderBy,
    skip: offset,
    take: limit,
    select: {
      guid: true,
      mainName: true,
      altNames: true,
      currentElo: true,
      combo: true,
      raceResult: {
        select: {
          createdAt: true
        }
      },
      _count: {
        select: { raceResult: true }
      }
    }
  });

  // OPTYMALIZACJA N+1:
  // Jeśli szukamy Top 5 po ELO od początku (page=0, sortBy=elo, bez wyszukiwania tekstowego),
  // ich pozycja globalna to po prostu index + 1. Nie musimy pytać bazy danych!
  const isTopEloRequest = page === 0 && sortBy === 'elo' && !search;

  const formattedDrivers: ExtendedDriver[] = await Promise.all(
    drivers.map(async (driver, index) => {
      let globalPosition = offset + index + 1;

      // Jeśli to nie jest standardowe top ELO (np. ktoś sortuje po nazwie lub filtruje),
      // dopiero wtedy odpalamy bezpiecznie pojedynczy count.
      if (!isTopEloRequest) {
        const higherEloCount = await prisma.driver.count({
          where: {
            currentElo: { gt: driver.currentElo }
          }
        });
        globalPosition = higherEloCount + 1;
      }

      // Wyciągamy najnowszą datę wyścigu
      const lastRacedDate = driver.raceResult.length > 0
        ? driver.raceResult.reduce((latest, current) =>
          current.createdAt > latest.createdAt ? current : latest
        ).createdAt
        : null;

      return {
        guid: driver.guid,
        mainName: driver.mainName,
        altNames: driver.altNames,
        currentElo: driver.currentElo,
        combo: driver.combo,
        racesCount: driver._count?.raceResult || 0,
        position: globalPosition,
        lastRaced: lastRacedDate ? lastRacedDate.toISOString() : null
      };
    })
  );

  const hasMore = drivers.length === limit;

  return {
    drivers: formattedDrivers,
    hasMore
  };
}

// Funkcja pomocnicza do względnego czasu
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInDays = Math.floor(diffInSeconds / 86400);

  if (diffInDays <= 0) {
    const diffInHours = Math.floor(diffInSeconds / 3600);
    if (diffInHours <= 0) return "Przed chwilą";
    return `${diffInHours} godz. temu`;
  }
  return `${diffInDays} dni temu`;
}

interface GetRecentlyActiveParams {
  sinceParam?: string;
  limitParam?: number;
}

export async function getRecentlyActiveDrivers({
  sinceParam = '14d', // Zmieniłem domyślnie na 14d, bo tak chciałeś na początku
  limitParam = 10
}: GetRecentlyActiveParams = {}): Promise<TickerDriver[]> {

  const limit = Math.min(limitParam, 50);

  // 1. Dodajemy await, aby pobrać dane z bazy, a nie samą obietnicę (Promise)
  const result = await prisma.event.findFirst({
    select: { date: true },
    orderBy: { date: 'desc' }
  });

  // 2. Wyciągamy datę (warto zabezpieczyć się na wypadek, gdyby baza była pusta)
  const now = result ? result.date : new Date();

  // POPRAWKA: Tworzymy kopię daty 'now', zamiast brać aktualny czas systemowy
  let sinceDate = new Date(now.getTime());

  const match = sinceParam.match(/^(\d+)([hdw])$/);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];

    // Operujemy na skopiowanej dacie 'now'
    if (unit === 'h') sinceDate.setHours(sinceDate.getHours() - value);
    else if (unit === 'd') sinceDate.setDate(sinceDate.getDate() - value);
    else if (unit === 'w') sinceDate.setDate(sinceDate.getDate() - value * 7);
  } else {
    const parsedDate = Date.parse(sinceParam);
    if (!isNaN(parsedDate)) {
      sinceDate = new Date(parsedDate);
    } else {
      // Tutaj też używamy bazy 'now'
      sinceDate.setDate(now.getDate() - 14);
    }
  }

  const recentResults = await prisma.raceResult.findMany({
    where: {
      createdAt: { gte: sinceDate }
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      createdAt: true,
      driver: {
        select: {
          guid: true,
          mainName: true,
          currentElo: true,
          combo: true
        }
      }
    }
  });

  const uniqueDriversMap = new Map<string, TickerDriver>();

  for (const result of recentResults) {
    if (!result.driver) continue;

    if (!uniqueDriversMap.has(result.driver.guid)) {
      uniqueDriversMap.set(result.driver.guid, {
        guid: result.driver.guid,
        name: result.driver.mainName,
        elo: result.driver.currentElo,
        combo: result.driver.combo,
        // Zwracamy surowy string daty ISO zamiast przetłumaczonego tekstu:
        lastActive: result.createdAt.toISOString()
      });
    }

    if (uniqueDriversMap.size >= limit) {
      break;
    }
  }

  return Array.from(uniqueDriversMap.values());
}