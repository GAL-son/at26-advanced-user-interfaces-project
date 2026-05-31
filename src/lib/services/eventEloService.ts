import { prisma } from '@/lib/db';

interface ACSMDriver {
    Guid: string;
    Name: string;
}

interface ACSMCar {
    Driver: ACSMDriver;
}

interface ACSMResult {
    DriverGuid: string;
}

interface ACSMResultsJson {
    Cars: ACSMCar[];
    Result: ACSMResult[]; 
    Date: string; 
}

interface DriverRatingData {
    guid: string;
    currentRating: number;
    position: number; 
    combo: number; 
}

interface UpdatedEloResult {
    guid: string;
    oldRating: number;
    newRating: number;
    ratingChange: number;
    position: number;
    combo: number; // 🟢 Przekazujemy combo do wyniku końcowego obliczeń
}

function calculateRaceElo(
    raceResults: DriverRatingData[],
    K: number = 48
): UpdatedEloResult[] {
    const numDrivers = raceResults.length;
    if (numDrivers < 2) return [];

    const ratingChanges = raceResults.map(d => ({ guid: d.guid, change: 0 }));

    for (let i = 0; i < numDrivers; i++) {
        for (let j = i + 1; j < numDrivers; j++) {
            const driverA = raceResults[i]; 
            const driverB = raceResults[j]; 

            const expectedA = 1 / (1 + Math.pow(10, (driverB.currentRating - driverA.currentRating) / 400));
            const actualA = 1;

            const pointsExchanged = K * (actualA - expectedA);
            const scaledChange = pointsExchanged / (numDrivers - 1);

            ratingChanges[i].change += scaledChange;
            ratingChanges[j].change -= scaledChange;
        }
    }

    return raceResults.map(driver => {
        const changeInfo = ratingChanges.find(c => c.guid === driver.guid)!;
        
        let baseChange = changeInfo.change;
        
        if (baseChange > 0) {
            const multiplier = 1 + 0.1 * driver.combo;
            baseChange = baseChange * multiplier;
        }

        const ratingChange = Math.round(baseChange);
        const newRating = Math.max(0, Math.round(driver.currentRating + baseChange));

        return {
            guid: driver.guid,
            oldRating: driver.currentRating,
            newRating: newRating,
            ratingChange: ratingChange,
            position: driver.position,
            combo: driver.combo // 🟢 Zwracamy pierwotne combo (przed inkrementacją)
        };
    });
}

export async function processEventElo(event: { id: string; resultsJsonUrl: string }) {
    const response = await fetch(event.resultsJsonUrl, {
        headers: { 'User-Agent': 'ACSM-Elo-Processor' },
        cache: 'no-store'
    });

    if (response.status === 429) throw new Error('RATE_LIMIT');
    if (!response.ok) throw new Error(`HTTP_ERROR_${response.status}`);

    const resultsData = (await response.json()) as ACSMResultsJson;

    if (!resultsData || !resultsData.Result || !Array.isArray(resultsData.Result)) {
        await prisma.event.update({ where: { id: event.id }, data: { processed: true } });
        return { skipped: true, reason: 'Pusta sekcja Result lub uszkodzony plik' };
    }

    const validResults = resultsData.Result.filter(r => r && r.DriverGuid);

    if (validResults.length < 2) {
        await prisma.event.update({ where: { id: event.id }, data: { processed: true } });
        return { skipped: true, reason: 'Mniej niż 2 kierowców w oficjalnych wynikach' };
    }

    const raceDriversData: DriverRatingData[] = [];
    const participantGuids: string[] = [];
    
    for (let index = 0; index < validResults.length; index++) {
        const row = validResults[index];
        const guid = row.DriverGuid.trim();
        participantGuids.push(guid);
        
        const dbDriver = await prisma.driver.findUnique({
            where: { guid },
            select: { currentElo: true, combo: true }
        });

        const currentRating = dbDriver ? dbDriver.currentElo : 1000.0;
        const currentCombo = dbDriver ? dbDriver.combo : 0;

        raceDriversData.push({
            guid,
            currentRating,
            position: index + 1,
            combo: currentCombo
        });
    }

    const eloUpdates = calculateRaceElo(raceDriversData);

    await prisma.$transaction(async (tx) => {
        for (const update of eloUpdates) {
            // A. Aktualizacja profilu kierowcy (przyszły wyścig będzie miał combo wyższe o 1)
            await tx.driver.update({
                where: { guid: update.guid },
                data: { 
                    currentElo: update.newRating,
                    combo: { increment: 1 } 
                }
            });

            // B. Zapis historii z utrwaleniem combo użytym w TYM wyścigu
            await tx.eloHistory.create({
                data: {
                    eventId: event.id,
                    driverGuid: update.guid,
                    eloBefore: update.oldRating,
                    eloAfter: update.newRating,
                    eloChange: update.ratingChange,
                    position: update.position,
                    combo: update.combo, // 🟢 Zapisujemy snapshot combo do tabeli historycznej
                    createdAt: new Date(resultsData.Date)
                }
            });
        }

        // C. Reset combo nieobecnym
        await tx.driver.updateMany({
            where: {
                guid: {
                    notIn: participantGuids
                }
            },
            data: {
                combo: 0
            }
        });

        await tx.event.update({
            where: { id: event.id },
            data: { processed: true }
        });
    });

    return { success: true, driversCalculated: eloUpdates.length };
}

export async function getEventEloResults(eventId: string) {
    return await prisma.eloHistory.findMany({
        where: { eventId },
        select: {
            driverGuid: true,
            eloBefore: true,
            eloAfter: true,
            eloChange: true,
            position: true,
            combo: true
        }
    });
}