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

        // Dynamiczne budowanie warunku wyszukiwania
        const where: Prisma.DriverWhereInput = search
            ? {
                OR: [
                    { mainName: { contains: search } },
                    { altNames: { contains: search } }
                ]
            }
            : {};

        // 1. Definiowanie sortowania głównego zapytania
        let orderBy: Prisma.DriverOrderByWithRelationInput;
        if (sortBy === 'name') {
            orderBy = { mainName: 'asc' };
        } else if (sortBy === 'races') {
            orderBy = { raceResult: { _count: 'desc' } };
        } else {
            orderBy = { currentElo: 'desc' };
        }

        // 2. Pobieramy kierowców dla aktualnej strony z bazy danych
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
                // Dodajemy agregację pobierającą datę ostatniego wyścigu
                _count: {
                    select: { raceResult: true }
                }
            }
        });

        // Wskazówka wydajnościowa: Pętla Promise.all wykonuje zapytanie N+1 (osobne zapytanie do bazy dla każdego kierowcy na stronie). 
        // Przy limit = 20 to aż 21 zapytań do bazy danych przy jednym strzale do endpointu.
        const driversWithGlobalPosition = await Promise.all(
            drivers.map(async (driver) => {
                const higherEloCount = await prisma.driver.count({
                    where: {
                        currentElo: {
                            gt: driver.currentElo
                        }
                    }
                });
                
                const globalPosition = higherEloCount + 1;

                // Szukamy najnowszej daty wyścigu z pobranej już relacji raceResult
                const lastRaced = driver.raceResult.length > 0 
                    ? driver.raceResult.reduce((latest, current) => 
                        new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
                      ).createdAt 
                    : null;

                return {
                    ...driver,
                    globalPosition,
                    lastRaced
                };
            })
        );

        // Mapowanie na obiekty typu Driver i dołączenie pozycji oraz lastRaced
        const formattedDrivers = driversWithGlobalPosition.map(driver => {
            const racesCount = driver._count?.raceResult || 0;

            const driverInstance = new Driver(
                driver.guid,
                driver.mainName,
                driver.altNames,
                driver.currentElo,
                driver.combo,
            );

            return {
                ...driverInstance,
                racesCount,
                position: driver.globalPosition,
                lastRaced: driver.lastRaced // <--- Nowe pole z datą ostatniego wyścigu
            };
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