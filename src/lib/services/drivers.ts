import { prisma } from '@/lib/db/db';

export interface TickerDriver {
  guid: string;
  name: string;
  elo: number;
  combo: number;
  lastActive: string;
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
  const now = new Date();
  let sinceDate = new Date();

  const match = sinceParam.match(/^(\d+)([hdw])$/);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];

    if (unit === 'h') sinceDate.setHours(now.getHours() - value);
    else if (unit === 'd') sinceDate.setDate(now.getDate() - value);
    else if (unit === 'w') sinceDate.setDate(now.getDate() - value * 7);
  } else {
    const parsedDate = Date.parse(sinceParam);
    if (!isNaN(parsedDate)) {
      sinceDate = new Date(parsedDate);
    } else {
      sinceDate.setDate(now.getDate() - 14);
    }
  }

  // Zapytanie do bazy przez Prismę
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
        lastActive: formatRelativeTime(result.createdAt)
      });
    }

    if (uniqueDriversMap.size >= limit) {
      break;
    }
  }

  return Array.from(uniqueDriversMap.values());
}