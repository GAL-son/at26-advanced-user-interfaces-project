import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ guid: string }> }
) {
    try {
        const { guid } = await params;
        const { searchParams } = new URL(request.url);
        
        const page = parseInt(searchParams.get('page') || '0', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const offset = page * limit;

        // 1. Pobieramy paczkę eventów posortowaną od najnowszego
        const events = await prisma.event.findMany({
            orderBy: { date: 'desc' },
            skip: offset,
            take: limit,
            include: {
                raceResult: {
                    where: { driverGuid: guid },
                    select: {
                        id: true,
                        eloBefore: true,
                        eloAfter: true,
                        combo: true,
                    }
                }
            }
        });

        // 2. Mapujemy eventy asynchronicznie, aby w razie potrzeby dociągnąć dane historyczne
        const formattedHistory = await Promise.all(
            events.map(async (event) => {
                const result = event.raceResult[0]; // max 1 element z filtra unique

                if (result) {
                    // Scenariusz A: Kierowca brał udział w wyścigu
                    return {
                        eventId: event.id,
                        eventName: event.name,
                        eventDate: event.date.toISOString(),
                        hasRaced: true,
                        id: result.id,
                        elo: Number(result.eloAfter ?? 1000),
                        eloChange: Number((result.eloAfter ?? 1000) - (result.eloBefore ?? 1000)),
                        combo: result.combo ?? 0
                    };
                }

                // Scenariusz B: Kierowca NIE brał udziału w tym wyścigu.
                // Szukamy OSTATNIEGO (najnowszego z przeszłości) wyścigu tego kierowcy PRZED datą obecnego eventu.
                const lastRaceBefore = await prisma.raceResult.findFirst({
                    where: {
                        driverGuid: guid,
                        event: {
                            date: { lt: event.date } // Mniejsza data niż obecny event
                        }
                    },
                    orderBy: {
                        event: { date: 'desc' } // Najnowszy z tych, które były wcześniej
                    },
                    select: {
                        eloAfter: true,
                        combo: true
                    }
                });

                // Jeśli znaleźliśmy poprzedni wyścig, bierzemy z niego eloAfter. 
                // Jeśli nie (to pierwszy event w historii całego systemu), bierzemy default 1000.
                const baseElo = lastRaceBefore?.eloAfter ?? 1000;
                const baseCombo = lastRaceBefore?.combo ?? 0;

                return {
                    eventId: event.id,
                    eventName: event.name,
                    eventDate: event.date.toISOString(),
                    hasRaced: false,
                    id: null,
                    elo: Number(baseElo),
                    eloChange: 0,
                    combo: baseCombo
                };
            })
        );

        const hasMore = events.length === limit;

        return NextResponse.json({
            success: true,
            data: formattedHistory,
            hasMore,
            nextPage: hasMore ? page + 1 : null
        });

    } catch (error: any) {
        console.error("[Driver Elo History API Error]:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}