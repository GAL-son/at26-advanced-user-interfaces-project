import { prisma } from '@/lib/db/db';

export interface GlobalStats {
  totalDrivers: number;
  totalEvents: number;
  averageElo: number;
}

export async function getGlobalStats(): Promise<GlobalStats> {
  try {
    // Odpalamy zapytania równolegle na poziomie bazy danych
    const [driversCount, eventsCount, eloAggregation] = await Promise.all([
      prisma.driver.count(),
      prisma.event.count(),
      prisma.driver.aggregate({
        _avg: {
          currentElo: true
        }
      })
    ]);

    return {
      totalDrivers: driversCount,
      totalEvents: eventsCount,
      averageElo: Math.round(eloAggregation._avg.currentElo || 1000)
    };
  } catch (error) {
    console.error("[Get Global Stats Service Error]:", error);
    return {
      totalDrivers: 0,
      totalEvents: 0,
      averageElo: 1000
    };
  }
}