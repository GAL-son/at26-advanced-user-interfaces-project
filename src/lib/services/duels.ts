import { prisma } from '@/lib/db/db';

export interface DuelDriver {
  guid: string;
  mainName: string;
  currentElo: number;
  combo: number;
  racesCount: number;
}

export interface VirtualDuel {
  categoryName: string;
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

// Funkcja pomocnicza: Wybiera losową parę spełniającą kryteria z listy kierowców
function findMatch(drivers: any[], maxPercent = 0.05): VirtualDuel | null {
  if (drivers.length < 2) return null;

  // Szukamy par o najbliższym ELO
  for (let i = 0; i < drivers.length - 1; i++) {
    const driverA = drivers[i];
    const driverB = drivers[i + 1];

    if (isEloClose(driverA.currentElo, driverB.currentElo, maxPercent)) {
      return {
        categoryName: '', // Uzupełniane wyżej
        categoryKey: 'top', 
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
    // 1. Pobieramy wszystkich aktywnych kierowców z podstawowymi metrykami, posortowanych po ELO malejąco
    const allDrivers = await prisma.driver.findMany({
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
    const topDrivers = allDrivers.filter(d => d.currentElo >= 1200 && (d._count?.raceResult ?? 0) > 10);
    const midfieldDrivers = allDrivers.filter(d => d.currentElo < 1200 && d.currentElo >= 950 && (d._count?.raceResult ?? 0) > 10);
    const rookieDrivers = allDrivers.filter(d => (d._count?.raceResult ?? 0) <= 10);

    // 3. Dopasowywanie par pojedynkowych
    const topDuel = findMatch(topDrivers, 0.05);
    if (topDuel) {
      topDuel.categoryName = "Czołówka (Top Split)";
      topDuel.categoryKey = "top";
    }

    const midfieldDuel = findMatch(midfieldDrivers, 0.05);
    if (midfieldDuel) {
      midfieldDuel.categoryName = "Środek Stawki (Midfield)";
      midfieldDuel.categoryKey = "midfield";
    }

    const rookiesDuel = findMatch(rookieDrivers, 0.08); // Dla rookies lekko zwiększamy tolerancję (8%), bo na początku ELO mocno skacze
    if (rookiesDuel) {
      rookiesDuel.categoryName = "Pojedynek Debiutantów (Rookies)";
      rookiesDuel.categoryKey = "rookies";
    }

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