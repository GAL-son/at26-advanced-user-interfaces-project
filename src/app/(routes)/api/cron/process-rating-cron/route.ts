import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/db';
import { updateEventRating, updateEventErosion } from '@/lib/services/rating.service';

// Bezpieczny limit dla pojedynczego przebiegu na Vercel (zapobiega timeoutom)
const PROCESSING_LIMIT = 50; 

export async function GET(request: Request) {
    // Autoryzacja dla bezpieczeństwa
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        console.log("[Cron] Starting Incremental Ratings Calculation...");

        // 1. Szukamy wyłącznie eventów, które nie posiadają jeszcze żadnych rekordów Rating.
        // Sortujemy je chronologicznie od najstarszych, aby prawidłowo budować historię ELO.
        const unprocessedEvents = await prisma.event.findMany({
            where: {
                ratings: {
                    none: {} // Warunek: brak powiązanych rekordów w relacji 'ratings'
                }
            },
            include: {
                sessions: {
                    include: {
                        results: true
                    }
                }
            },
            orderBy: {
                date: 'asc' // Od najstarszego do najnowszego
            },
            take: PROCESSING_LIMIT
        });

        console.log(`[Cron] Found ${unprocessedEvents.length} unprocessed events.`);

        if (unprocessedEvents.length === 0) {
            return NextResponse.json({ message: "All events are already processed." });
        }

        let processedCount = 0;

        // 2. Przetwarzamy znalezione eventy jeden po drugim
        for (const event of unprocessedEvents) {
            console.log(`\n[Cron] Processing: [${event.date.toISOString().split('T')[0]}] - ${event.name}`);

            // Zbieramy unikalne GUIDy kierowców biorących udział w sesjach tego eventu
            const driverGuidsInEvent = new Set<string>();
            event.sessions.forEach(session => {
                session.results.forEach(res => driverGuidsInEvent.add(res.driverGuid));
            });

            const guidsArray = Array.from(driverGuidsInEvent);

            if (guidsArray.length === 0) {
                console.log(`[Cron] No drivers in this event - skipping rating & erosion`);
                
                // UWAGA: Aby pusty event nie blokował pętli w nieskończoność przy kolejnych wywołaniach crona, 
                // warto stworzyć chociażby pusty/dummy wpis w tabeli Rating lub oznaczyć ten event jako przetworzony.
                // Jeśli w ACSM puste eventy się nie zdarzają, ten blok rzadko się wykona.
                processedCount++;
                continue; 
            }

            // Pytamy bazę bezpośrednio o najbardziej aktualny stan kierowców na ten moment
            const driversFromDb = await prisma.driver.findMany({
                where: {
                    guid: { in: guidsArray }
                },
                select: {
                    guid: true,
                    currentRating: true,
                    bestRating: true,
                    combo: true,
                    joined: true
                }
            });

            // Przygotowujemy DTO dla kalkulatora ratingów
            const eventDataDto = {
                id: event.id,
                date: event.date,
                drivers: driversFromDb.map(d => ({
                    guid: d.guid,
                    rating: d.currentRating,
                    bestRating: d.bestRating,
                    combo: d.combo,
                    joined: d.joined
                })),
                sessions: event.sessions
            };

            // Obliczamy i aktualizujemy wyścigowy ELO aktywnych kierowców
            await updateEventRating(eventDataDto);
            console.log(`[Cron] Updated rating for ${driversFromDb.length} drivers.`);

            // Przygotowujemy DTO pod erozję dla nieobecnych
            const erosionEventDto = {
                id: event.id,
                date: event.date,
                drivers: driversFromDb.map(d => ({
                    guid: d.guid,
                    rating: d.currentRating,
                    bestRating: d.bestRating,
                    combo: d.combo,
                    joined: d.joined
                })),
                sessions: []
            };

            // Wyliczamy erozję dla reszty stawki, która już dołączyła do ligi
            await updateEventErosion(erosionEventDto);
            console.log(`[Cron] Erosion calculated`);

            processedCount++;
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully processed ${processedCount} new events.` 
        });

    } catch (error) {
        console.error("[Cron Rating Error]", error);
        return NextResponse.json({ error: "Internal Server Error during ratings calculation" }, { status: 500 });
    }
}