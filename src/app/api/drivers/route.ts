import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/db';
import { Prisma } from '@prisma/client';
import { Driver } from '@/lib/db/types';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '0', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const search = searchParams.get('search') || '';
        const sortBy = searchParams.get('sortBy') || 'elo';

        const offset = page * limit;

        // 1. Jawne określenie typu dla orderBy przy użyciu typów Prismy
        let orderBy: Prisma.DriverOrderByWithRelationInput;

        if (sortBy === 'name') {
            orderBy = { mainName: 'asc' };
        } else if (sortBy === 'races') {
            // Sortujemy po liczbie powiązanych rekordów z relacji raceResult
            orderBy = { raceResult: { _count: 'desc' } };
        } else if (sortBy === 'lastRaced') {
            // Prisma nie pozwala na bezpośrednie sortowanie po polu z relacji "wiele do wielu" / "jeden do wielu" w ten sposób.
            // Najbezpieczniej domyślnie posortować po ELO lub ID, a filtrowanie/sortowanie dany dociągnąć w pamięci,
            // albo upewnić się, czy lastRaced to na pewno relacja 1-do-1.
            orderBy = { currentElo: 'desc' };
        } else {
            orderBy = { currentElo: 'desc' };
        }

        // Dynamiczne budowanie warunku wyszukiwania
        const where: Prisma.DriverWhereInput = search
            ? {
                OR: [
                    { mainName: { contains: search } },
                    { altNames: { contains: search } }
                ]
            }
            : {};
        // Bezpieczne zapytanie za pomocą Prisma ORM
        const drivers = await prisma.driver.findMany({
            where,
            orderBy,
            skip: offset,
            take: limit,
            select: {
                guid: true,
                mainName: true,
                altNames: true,
                currentElo: true,
                combo: true,
                raceResult: {
                    select: {
                        id: true,
                        eventId: true,
                        driverGuid: true,
                        started: true,
                        position: true,
                        car: true,
                        laps: true,
                        totalTime: true,
                        bestLap: true,
                        gap: true,
                        eloBefore: true,
                        eloAfter: true,
                        combo: true,
                        eloAlg: true,
                        createdAt: true
                    }
                },
                // Zamiast sztucznego racesCount, używamy wbudowanego mechanizmu Prismy:
                _count: {
                    select: { raceResult: true } // Zwróci { raceResult: liczba_wyścigów }
                }
            }
        });

        // Mapowanie na obiekty typu Driver
        const formattedDrivers = drivers.map(driver => {
            // Wyciągamy liczbę wyścigów z obiektu agregacji _count
            const racesCount = driver._count?.raceResult || 0;

            return new Driver(
                driver.guid,
                driver.mainName,
                driver.altNames,
                driver.currentElo,
                driver.combo,
            );
        });

        const hasMore = drivers.length === limit;
        return NextResponse.json({
            success: true,
            drivers: formattedDrivers,
            hasMore,
            nextPage: hasMore ? page + 1 : null
        });

    } catch (error: any) {
        console.error("[Drivers API Error]:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}