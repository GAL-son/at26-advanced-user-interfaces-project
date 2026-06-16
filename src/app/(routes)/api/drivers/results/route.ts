// src/app/api/drivers/results/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // 1. Pobranie i walidacja guidów
        const guidsParam = searchParams.get('guids');
        if (!guidsParam) {
            return NextResponse.json({ success: false, error: 'Guids parameter is required' }, { status: 400 });
        }

        const guids = guidsParam.split(',').map(g => g.trim()).filter(Boolean);
        if (guids.length === 0) {
            return NextResponse.json({ success: false, error: 'Invalid guids parameter' }, { status: 400 });
        }

        // 2. Parametry paginacji wyścigów
        const page = parseInt(searchParams.get('page') || '0', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const offset = page * limit;

        // 3. Pobieramy nazwy kierowców oraz ich OSTATNIE (aktualne) ELO i Combo przed pętlą
        const drivers = await prisma.driver.findMany({
            where: { guid: { in: guids } },
            select: { 
                guid: true, 
                mainName: true,
                // Zakładam, że masz te pola w modelu Driver jako aktualny stan. 
                // Jeśli nie, w pętli bezpiecznie ustawimy domyślne 1000 i 0, dopóki nie znajdziemy pierwszego zapisu.
            }
        });

        const driverNamesMap = new Map(drivers.map(d => [d.guid, d.mainName]));

        // 4. Pobieramy listę wydarzeń z wynikami TYLKO dla interesujących nas kierowców
        const events = await prisma.event.findMany({
            orderBy: { date: 'desc' },
            skip: offset,
            take: limit,
            include: {
                raceResult: {
                    where: { driverGuid: { in: guids } },
                    select: {
                        id: true,
                        driverGuid: true,
                        pos: true,          // Dodane: pozycja w wyścigu
                        eloBefore: true,
                        eloAfter: true,
                        combo: true,
                    }
                }
            }
        });

        // Inicjalizacja struktury danych dla odpowiedzi
        const groupedResults: { [key: string]: { name: string; data: any[] } } = {};
        guids.forEach(guid => {
            groupedResults[guid] = {
                name: driverNamesMap.get(guid) || 'Unknown Driver',
                data: []
            };
        });

        // Słownik do śledzenia "stanu przejściowego" ELO/Combo dla kierowców, którzy nie jechali w danej paczce
        // Wypełniamy go dopiero w momencie, gdy trafimy na jakikolwiek historyczny wynik kierowcy
        const runningState = new Map<string, { elo: number; combo: number }>();

        // 5. Przetwarzamy eventy (leci od najnowszych do najstarszych dzięki orderBy: 'desc')
        for (const event of events) {
            const eventResultsMap = new Map(event.raceResult.map(r => [r.driverGuid, r]));

            for (const guid of guids) {
                const result = eventResultsMap.get(guid);

                if (result) {
                    const eloAfter = Number(result.eloAfter ?? 1000);
                    const eloBefore = Number(result.eloBefore ?? 1000);
                    const currentCombo = result.combo ?? 0;

                    // Scenariusz A: Kierowca brał udział w tym evencie
                    groupedResults[guid].data.push({
                        eventId: event.id,
                        eventName: event.name,
                        eventDate: event.date.toISOString(),
                        hasRaced: true,
                        id: result.id,
                        pos: result.pos, // Pozycja z wyścigu
                        elo: eloAfter,
                        eloChange: Number(eloAfter - eloBefore),
                        combo: currentCombo
                    });

                    // Aktualizujemy stan "wsteczny" – jeśli wyścig wcześniej nie jechał, 
                    // jego punktem odniesienia będzie eloBefore z tego (późniejszego) wyścigu
                    runningState.set(guid, { elo: eloBefore, combo: currentCombo });

                } else {
                    // Scenariusz B: Kierowca NIE brał udziału w tym evencie
                    // Próbujemy wyciągnąć stan z pamięci podręcznej (ostatni przetworzony wyścig chronologicznie)
                    let cachedState = runningState.get(guid);

                    // Jeśli nie mamy nic w pamięci, musimy jednorazowo zapytać o ELO *przed* tym eventem
                    if (!cachedState) {
                        const lastRaceBefore = await prisma.raceResult.findFirst({
                            where: {
                                driverGuid: guid,
                                event: { date: { lt: event.date } }
                            },
                            orderBy: { event: { date: 'desc' } },
                            select: { eloAfter: true, combo: true }
                        });

                        cachedState = {
                            elo: Number(lastRaceBefore?.eloAfter ?? 1000),
                            combo: lastRaceBefore?.combo ?? 0
                        };
                        runningState.set(guid, cachedState);
                    }

                    groupedResults[guid].data.push({
                        eventId: event.id,
                        eventName: event.name,
                        eventDate: event.date.toISOString(),
                        hasRaced: false,
                        id: null,
                        pos: null, // Nie jechał, więc brak pozycji
                        elo: cachedState.elo,
                        eloChange: 0,
                        combo: cachedState.combo
                    });
                }
            }
        }

        // Mapowanie słownika na płaską strukturę tablicową dla frontendu
        const formattedResults = Object.entries(groupedResults).map(([guid, group]) => ({
            guid,
            name: group.name,
            data: group.data
        }));

        const hasMore = events.length === limit;

        return NextResponse.json({
            success: true,
            data: formattedResults,
            hasMore,
            nextPage: hasMore ? page + 1 : null
        });

    } catch (error: any) {
        console.error("[Drivers Results API Error]:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}