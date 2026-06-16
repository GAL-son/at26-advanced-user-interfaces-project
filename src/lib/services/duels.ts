import { prisma } from '@/lib/db/db';

export interface DuelDriver {
  guid: string;
  mainName: string;
  currentElo: number;
  combo: number;
  racesCount: number;
}

export interface VirtualDuel {
  // USUNIĘTO: categoryName
  categoryKey: 'top' | 'midfield' | 'rookies' | 'extended';
  driverA: DuelDriver;
  driverB: DuelDriver;
  eloDifference: number;
}

export interface DashboardDuels {
  top: VirtualDuel | null;
  midfield: VirtualDuel | null;
  rookies: VirtualDuel | null;
}

// Funkcja pomocnicza: Sprawdza czy różnica ELO mieści się w limitParam % (domyślnie 5%)
function isEloClose(eloA: number, eloB: number, maxPercent = 0.05): boolean {
  const diff = Math.abs(eloA - eloB);
  const minElo = Math.min(eloA, eloB);
  return diff <= minElo * maxPercent;
}

// Funkcja pomocnicza: Wybiera parę spełniającą kryteria z listy kierowców
function findMatch(drivers: any[], maxPercent = 0.05): Omit<VirtualDuel, 'categoryKey'> | null {
  if (drivers.length < 2) return null;

  // Szukamy par o najbliższym ELO
  for (let i = 0; i < drivers.length - 1; i++) {
    const driverA = drivers[i];
    const driverB = drivers[i + 1];

    if (isEloClose(driverA.currentElo, driverB.currentElo, maxPercent)) {
      return {
        eloDifference: Math.abs(Math.round(driverA.currentElo - driverB.currentElo)),
        driverA: {
          guid: driverA.guid,
          mainName: driverA.mainName,
          currentElo: driverA.currentElo,
          combo: driverA.combo,
          racesCount: driverA._count?.raceResult || 0,
        },
        driverB: {
          guid: driverB.guid,
          mainName: driverB.mainName,
          currentElo: driverB.currentElo,
          combo: driverB.combo,
          racesCount: driverB._count?.raceResult || 0,
        }
      };
    }
  }
  return null;
}

export async function getVirtualDuels(): Promise<DashboardDuels> {
  try {
    // Obliczamy datę sprzed 4 tygodni
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    // 1. Pobieramy aktywnych kierowców (wyścig w ciągu ostatnich 4 tygodni), posortowanych po ELO malejąco
    const activeDrivers = await prisma.driver.findMany({
      where: {
        raceResult: {
          some: {
            event: {
              date: {
                gte: fourWeeksAgo,
              },
            },
          },
        },
      },
      orderBy: {
        currentElo: 'desc',
      },
      select: {
        guid: true,
        mainName: true,
        currentElo: true,
        combo: true,
        _count: {
          select: { raceResult: true },
        },
      },
    });

    // 2. Segmentacja kierowców na kategorie
    const topDrivers = activeDrivers.filter(d => d.currentElo >= 1200 && (d._count?.raceResult ?? 0) > 10);
    const midfieldDrivers = activeDrivers.filter(d => d.currentElo < 1200 && d.currentElo >= 950 && (d._count?.raceResult ?? 0) > 10);
    const rookieDrivers = activeDrivers.filter(d => (d._count?.raceResult ?? 0) <= 10);

    // 3. Dopasowywanie par pojedynkowych i przypisywanie wyłącznie klucza
    const topMatch = findMatch(topDrivers, 0.05);
    const topDuel: VirtualDuel | null = topMatch 
      ? { ...topMatch, categoryKey: "top" } 
      : null;

    const midfieldMatch = findMatch(midfieldDrivers, 0.05);
    const midfieldDuel: VirtualDuel | null = midfieldMatch 
      ? { ...midfieldMatch, categoryKey: "midfield" } 
      : null;

    const rookiesMatch = findMatch(rookieDrivers, 0.08);
    const rookiesDuel: VirtualDuel | null = rookiesMatch 
      ? { ...rookiesMatch, categoryKey: "rookies" } 
      : null;

    return {
      top: topDuel,
      midfield: midfieldDuel,
      rookies: rookiesDuel,
    };

  } catch (error) {
    console.error("[Get Virtual Duels Service Error]:", error);
    return { top: null, midfield: null, rookies: null };
  }
}