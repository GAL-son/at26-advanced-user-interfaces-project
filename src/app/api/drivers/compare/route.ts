import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Pobierz listę guid graczy z parametrów URL
        const guidsParam = searchParams.get('guids');
        if (!guidsParam) {
            return NextResponse.json({ success: false, error: 'Guids parameter is required' }, { status: 400 });
        }

        const guids = guidsParam.split(',');

        // Pobierz paginację z parametrów URL
        const page = parseInt(searchParams.get('page') || '0', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const offset = page * limit;

        // 1. Pobieramy profile kierowców, aby mieć dostęp do ich nazw (mainName)
        const drivers = await prisma.driver.findMany({
            where: { guid: { in: guids } },
            select: { guid: true, mainName: true }
        });

        // Tworzymy mapę [guid]: name dla szybkiego dostępu
        const driverNamesMap = new Map(drivers.map(d => [d.guid, d.mainName]));

        // 2. Pobieramy globalną listę wydarzeń (Event) posortowaną chronologicznie od najnowszych
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
                        eloBefore: true,
                        eloAfter: true,
                        combo: true,
                    }
                }
            }
        });

        // Inicjalizujemy strukturę danych dla grupowania wyników
        const groupedResults: { [key: string]: { name: string; data: any[] } } = {};
        guids.forEach(guid => {
            groupedResults[guid] = {
                name: driverNamesMap.get(guid) || 'Unknown Driver',
                data: []
            };
        });

        // 3. Przetwarzamy każdy event dla każdego kierowcy po kolei
        for (const event of events) {
            // Tworzymy mapę wyników z tego konkretnego wyścigu dla szybkiego wyszukiwania O(1)
            const eventResultsMap = new Map(event.raceResult.map(r => [r.driverGuid, r]));

            await Promise.all(
                guids.map(async (guid) => {
                    const result = eventResultsMap.get(guid);

                    if (result) {
                        // Scenariusz A: Kierowca brał udział w wyścigu
                        groupedResults[guid].data.push({
                            eventId: event.id,
                            eventName: event.name,
                            eventDate: event.date.toISOString(),
                            hasRaced: true,
                            id: result.id,
                            elo: Number(result.eloAfter ?? 1000),
                            eloChange: Number((result.eloAfter ?? 1000) - (result.eloBefore ?? 1000)),
                            combo: result.combo ?? 0
                        });
                    } else {
                        // Scenariusz B: Kierowca NIE brał udziału w wyścigu.
                        // Szukamy ostatniego wyniku z przeszłości (przed tym eventem)
                        const lastRaceBefore = await prisma.raceResult.findFirst({
                            where: {
                                driverGuid: guid,
                                event: {
                                    date: { lt: event.date }
                                }
                            },
                            orderBy: {
                                event: { date: 'desc' }
                            },
                            select: {
                                eloAfter: true,
                                combo: true
                            }
                        });

                        const baseElo = lastRaceBefore?.eloAfter ?? 1000;
                        const baseCombo = lastRaceBefore?.combo ?? 0;

                        groupedResults[guid].data.push({
                            eventId: event.id,
                            eventName: event.name,
                            eventDate: event.date.toISOString(),
                            hasRaced: false,
                            id: null,
                            elo: Number(baseElo),
                            eloChange: 0,
                            combo: baseCombo
                        });
                    }
                })
            );
        }

        // Przekształcamy pogrupowane wyniki na finalny format tablicy
        const formattedResults = Object.entries(groupedResults).map(([guid, group]) => ({
            guid,
            name: group.name,
            data: group.data
        }));

        // Paginacja bazuje teraz na liczbie przetworzonych wydarzeń (Event)
        const hasMore = events.length === limit;

        return NextResponse.json({
            success: true,
            data: formattedResults,
            hasMore,
            nextPage: hasMore ? page + 1 : null
        });

    } catch (error: any) {
        console.error("[Driver Compare Elo API Error]:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}