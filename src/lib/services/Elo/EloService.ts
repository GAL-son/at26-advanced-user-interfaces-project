import { prisma } from '@/lib/db/db';
import { type RaceResult } from '@/lib/db/types';
import {currentAlgorithm} from './EloConfig'

export async function processEventElo(eventId: string, rawRaceResults: RaceResult[]) {
  if (!rawRaceResults || rawRaceResults.length < 2) {
    await prisma.event.update({ where: { id: eventId }, data: { processed: true } });
    return { skipped: true, reason: 'Mniej niż 2 kierowców w przekazanych wynikach' };
  }

  // 1. Wywołanie generycznego algorytmu z konfiguracji
  const updatedResults = currentAlgorithm.calculate(rawRaceResults);

  // Zbieramy GUIDy kierowców, którzy brali udział, aby pozostałym zresetować combo
  const participantGuids = updatedResults.map(r => r.driverGuid);

  // 2. Transakcja bazodanowa
  await prisma.$transaction(async (tx) => {
    for (const result of updatedResults) {
      
      // A. Aktualizacja profilu kierowcy (nowe ELO + inkrementacja combo)
      await tx.driver.update({
        where: { guid: result.driverGuid },
        data: { 
          currentElo: result.eloAfter!,
          combo: { increment: 1 } 
        }
      });

      // B. Zapis wyniku wyścigu do tabeli relacyjnej
      await tx.raceResult.create({
        data: {
          eventId: result.eventId,
          driverGuid: result.driverGuid,
          started: result.started,
          position: result.position,
          car: result.car,
          laps: result.laps,
          totalTime: result.totalTime,
          bestLap: result.bestLap,
          gap: result.gap,
          eloBefore: result.eloBefore,
          eloAfter: result.eloAfter,
          combo: result.combo, // Zapisujemy stan combo użyty w TYM wyścigu
          eloAlg: result.eloAlg,
          createdAt: result.createdAt
        }
      });
    }

    // C. Reset combo kierowcom, którzy nie jechali w tym evencie
    await tx.driver.updateMany({
      where: { guid: { notIn: participantGuids } },
      data: { combo: 0 }
    });

    // D. Oznaczenie eventu jako przetworzony w bazie
    await tx.event.update({
      where: { id: eventId },
      data: { processed: true }
    });
  });

  return { 
    success: true, 
    driversCalculated: updatedResults.length, 
    algorithmUsed: currentAlgorithm.name 
  };
}