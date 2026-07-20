import { getAllEventsChronologically } from '@/lib/services/events.service';
import { updateEventRating, updateEventErosion } from '@/lib/services/rating.service';
import { config } from '@/lib/services/rating.service'; // Zaimportuj obiekt config, aby mieć dostęp do startingRating
import { prisma } from '../lib/db/db';

// Interfejs opisujący strukturę pamięci podręcznej dla stanu kierowcy
interface DriverRuntimeState {
    guid: string;
    rating: number;
    bestRating: number;
    combo: number;
}

async function main() {
    console.log("🚀 Seeding Ratings - Full Chronological Recalculation");

    try {
        const allEvents = await getAllEventsChronologically();
        console.log(`Found ${allEvents.length} Events.`);

        // Słownik przechowujący bieżący stan każdego kierowcy w pamięci ram skryptu.
        // Będzie on aktualizowany po każdym evencie i przekazywany do następnego.
        const driversStateCache: Record<string, DriverRuntimeState> = {};

        for (const event of allEvents) {
            console.log(`\nProcessing: [${event.date.toISOString().split('T')[0]}] - ${event.name}`);

            const driverGuidsInEvent = new Set<string>();
            event.sessions.forEach(session => {
                session.results.forEach(res => driverGuidsInEvent.add(res.driverGuid));
            });

            const guidsArray = Array.from(driverGuidsInEvent);

            if (guidsArray.length === 0) {
                console.log(`No drivers in this event`);
            } else {
                // POPRAWKA: Zamiast pytać bazę o stan kierowcy, inicjalizujemy go z configu 
                // lub wyciągamy stan zapamiętany z POPRZEDNIEGO eventu.
                const currentDriversData = guidsArray.map(guid => {
                    // Jeśli kierowca pojawia się w historii po raz pierwszy:
                    if (!driversStateCache[guid]) {
                        driversStateCache[guid] = {
                            guid: guid,
                            rating: config.startingRating,     // Wartość bazowa ELO
                            bestRating: config.startingRating, // Wartość bazowa Best ELO
                            combo: 0                           // Startowe combo
                        };
                    }
                    return driversStateCache[guid];
                });

                const eventDataDto = {
                    id: event.id,
                    drivers: currentDriversData.map(d => ({
                        guid: d.guid,
                        rating: d.rating,
                        bestRating: d.bestRating,
                        combo: d.combo
                    })),
                    sessions: event.sessions
                };

                // Obliczamy i zapisujemy w bazie wyścigowy rating.
                await updateEventRating(eventDataDto);
                console.log(`Updated rating for ${currentDriversData.length} drivers.`);
            }

            // Naliczanie erozji dla nieobecnych
            const erosionEventDto = {
                id: event.id,
                drivers: guidsArray.map(guid => ({ guid, rating: 0, bestRating: 0, combo: 0 })),
                sessions: []
            };

            await updateEventErosion(erosionEventDto);
            console.log(`Erosion calculated`);

            // === STRATEGICZNA POPRAWKA: ODŚWIEŻENIE CACHE'U PO ZAPISIE W BAZIE ===
            // Po wykonaniu updateEventRating oraz updateEventErosion, Prisma zapisała nowe dane w tabeli Driver.
            // Musimy je pobrać z bazy i zaktualizować nasz lokalny driversStateCache, 
            // aby w KOLEJNEJ iteracji pętli (dla następnego eventu) skrypt miał w pamięci te nowe, świeże wartości.
            const updatedDriversFromDb = await prisma.driver.findMany({
                select: {
                    guid: true,
                    currentRating: true,
                    bestRating: true,
                    combo: true
                }
            });

            // Aktualizujemy lokalny stan dla wszystkich znanych systemowi kierowców
            for (const d of updatedDriversFromDb) {
                driversStateCache[d.guid] = {
                    guid: d.guid,
                    rating: d.currentRating,
                    bestRating: d.bestRating,
                    combo: d.combo
                };
            }
        }

        console.log("\nFinished successfully!");

    } catch (error) {
        console.error("Failed seed", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();