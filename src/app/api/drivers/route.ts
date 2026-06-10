import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/db';
import { Prisma } from '@prisma/client'; // <-- Konieczny import

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        
        const page = parseInt(searchParams.get('page') || '0', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const search = searchParams.get('search') || '';
        const sortBy = searchParams.get('sortBy') || 'elo';

        const offset = page * limit;

        // 1. Definiowanie sortowania przy użyciu Prisma.sql
        // Dzięki temu wstawiamy bezpieczne fragmenty SQL bezpośrednio do zapytania.
        let rowNumberOrderBy;
        if (sortBy === 'name') {
            rowNumberOrderBy = Prisma.sql`d.mainName ASC`;
        } else if (sortBy === 'races') {
            rowNumberOrderBy = Prisma.sql`COUNT(eh.id) DESC`; 
        } else if (sortBy === 'lastRaced') {
            rowNumberOrderBy = Prisma.sql`MAX(eh.createdAt) DESC`;
        } else {
            rowNumberOrderBy = Prisma.sql`d.currentElo DESC`;
        }

        // 2. Dynamiczne budowanie warunku wyszukiwania za pomocą Prisma.sql
        // Prisma.sql zadba o to, żeby parametr został dodany DOPIERO wtedy, gdy istnieje.
        const searchFilter = search 
            ? Prisma.sql`LOWER(mainName) LIKE LOWER(${`%${search}%`}) OR LOWER(altNames) LIKE LOWER(${`%${search}%`})` 
            : Prisma.sql`1 = 1`;

        // 3. Bezpieczne zapytanie przez $queryRaw z backtickami (tagged template literal)
        // Prisma wygeneruje '?' pod maską na dev, a '$1' na produkcji. Znika problem z limitami i offsetami.
        const rawDrivers = await prisma.$queryRaw<any[]>`
            WITH RankedDrivers AS (
                SELECT 
                    d.guid,
                    d.mainName,
                    d.altNames,
                    d.combo,
                    d.currentElo,
                    COUNT(eh.id) as racesCount,
                    MAX(eh.createdAt) as lastRaced,
                    ROW_NUMBER() OVER (
                        ORDER BY ${rowNumberOrderBy}, d.mainName ASC
                    ) as position
                FROM "Driver" d
                INNER JOIN "EloHistory" eh ON eh."driverGuid" = d.guid
                GROUP BY d.guid, d.mainName, d.altNames, d.combo, d.currentElo
            )
            SELECT * FROM RankedDrivers
            WHERE ${searchFilter}
            ORDER BY position ASC
            LIMIT ${limit} OFFSET ${offset}
        `;

        // 4. Mapowanie typów (konwersja BigInt z bazy na Number)
        const formattedDrivers = rawDrivers.map(driver => ({
            ...driver,
            racesCount: Number(driver.racesCount),
            position: Number(driver.position)
        }));

        const hasMore = formattedDrivers.length === limit;

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