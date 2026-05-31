import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        
        const page = parseInt(searchParams.get('page') || '0', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const search = searchParams.get('search') || '';
        const sortBy = searchParams.get('sortBy') || 'elo';

        const whereClause: Prisma.DriverWhereInput = {
            eloHistory: {
                some: {} // Sprawdza, czy istnieje choćby jeden powiązany wpis w EloHistory
            },
            ...(search ? {
                OR: [
                    { mainName: { contains: search } },
                    { altNames: { contains: search } },
                ]
            } : {})
        };

        // Definiowanie sortowania głównego
        let orderByClause: Prisma.DriverOrderByWithRelationInput = {};
        
        if (sortBy === 'name') {
            orderByClause = { mainName: 'asc' };
        } else if (sortBy === 'races') {
            orderByClause = { eloHistory: { _count: 'desc' } };
        } else if (sortBy === 'lastRaced') {
            // Sortowanie po dacie najnowszego wpisu w historii ELO (od najświeższych)
            orderByClause = { eloHistory: { _max: { createdAt: 'desc' } } };
        } else {
            orderByClause = { currentElo: 'desc' };
        }

        const drivers = await prisma.driver.findMany({
            where: whereClause,
            orderBy: [
                orderByClause,
                { mainName: 'asc' }
            ],
            skip: page * limit,
            take: limit,
            // 🟢 Wyciągamy jawnie combo z bazy danych
            select: {
                guid: true,
                mainName: true,
                altNames: true,
                currentElo: true,
                combo: true,
                _count: {
                    select: { eloHistory: true }
                },
                eloHistory: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { createdAt: true }
                }
            }
        });

        // Przekształcamy strukturę, żeby frontend dostał prostego stringa z datą zamiast zagnieżdżonej tablicy
        const formattedDrivers = drivers.map(driver => {
            const lastRaceDate = driver.eloHistory[0]?.createdAt || null;
            return {
                guid: driver.guid,
                mainName: driver.mainName,
                altNames: driver.altNames,
                combo: driver.combo,
                currentElo: driver.currentElo,
                racesCount: driver._count.eloHistory,
                lastRaced: lastRaceDate
            };
        });

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