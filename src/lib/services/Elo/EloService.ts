import { prisma } from '@/lib/db/db';
import { type RaceResult } from '@/lib/db/types';
import { currentAlgorithm } from './EloConfig'

export async function processEventElo(eventId: string, rawRaceResults: RaceResult[]) {
  if (!rawRaceResults || rawRaceResults.length < 2) {
    if (rawRaceResults.length === 1) {
      const singleResult = rawRaceResults[0];
      await prisma.raceResult.update({
        where: { id: singleResult.id },
        data: {
          eloBefore: singleResult.eloBefore ?? 1000,
          eloAfter: singleResult.eloBefore ?? 1000, // ELO się nie zmienia
          combo: singleResult.combo ?? 0,
          eloAlg: currentAlgorithm.name
        }
      });
    }

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
      await tx.raceResult.update({
        where: { id: result.id }, // Używamy oryginalnego ID rekordu z bazy
        data: {
          eloBefore: result.eloBefore,
          eloAfter: result.eloAfter,
          combo: result.combo,
          eloAlg: result.eloAlg,
          // Nie musisz aktualizować reszty pól jak laps czy totalTime, bo one się nie zmieniły
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