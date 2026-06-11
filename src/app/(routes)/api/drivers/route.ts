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
                        createdAt: true
                    }
                },
                _count: {
                    select: { raceResult: true }
                }
            }
        });

        // 3. JEŚLI wyszukiwanie (search) jest puste, pozycja globalna wynika wprost z offsetu (strony)
        // JEŚLI użytkownik coś wpisuje, pozycja "globalna" staje się pozycją w wynikach wyszukiwania.
        // Jeśli absolutnie potrzebujesz pozycji w skali CAŁEJ bazy nawet podczas filtrowania "search", 
        // daj znać – wtedy optymalnym rozwiązaniem będzie użycie Prisma.$queryRaw z funkcją okna DENSE_RANK().
        
        const formattedDrivers = drivers.map((driver, index) => {
            const racesCount = driver._count?.raceResult || 0;

            // Logika pozycji: bazuje na aktualnym miejscu w pobranej paczce + offsecie stronnicowania
            const globalPosition = offset + index + 1;

            // Szukamy najnowszej daty wyścigu z pobranej już relacji raceResult
            const lastRaced = driver.raceResult.length > 0 
                ? driver.raceResult.reduce((latest, current) => 
                    new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
                  ).createdAt 
                : null;

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
                position: globalPosition,
                lastRaced
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