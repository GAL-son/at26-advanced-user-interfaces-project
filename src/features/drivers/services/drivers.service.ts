"use server"
import { prisma } from '@/lib/db/db';
import { Prisma } from '@prisma/client';

import { RATING_CONFIG } from "@/lib/config/rating.config";

import type {
    DriverBasicDto, 
    DriverDetailsDto, 
    DriverSortOption,
    DriverListItemDto,
    PaginatedDriversResult,
} from '../drivers.types';


/**
 * 
 * @param query 
 * @param limit 
 * @returns 
 */
export async function searchDrivers(query: string, limit: number = 10): Promise<DriverBasicDto[]> {
    if (!query || query.trim().length === 0) {
        return [];
    }

    const cleanQuery = `%${query.trim().toLowerCase()}%`;

    const drivers = await prisma.driver.findMany({
        where: {
            OR: [
                { mainName: { contains: cleanQuery } },
                { altNames: { contains: cleanQuery } }
            ]
        },
        select: {
            guid: true,
            mainName: true,
            currentRating: true
        },
        take: limit,
        orderBy: {
            currentRating: 'desc'
        }
    });

    return drivers.map(d => ({
        guid: d.guid,
        mainName: d.mainName,
        currentRating: d.currentRating
    }));
}

/**
 * 
 * @param guids 
 * @returns 
 */
export async function getDriversBasicInfoByGuids(guids: string[]): Promise<DriverBasicDto[]> {
    if (!guids || guids.length === 0) {
        return [];
    }

    const drivers = await prisma.driver.findMany({
        where: {
            guid: { in: guids }
        },
        select: {
            guid: true,
            mainName: true,
            currentRating: true
        }
    });

    return drivers.map(d => ({
        guid: d.guid,
        mainName: d.mainName,
        currentRating: d.currentRating
    }));
}

/**
 * 
 * @param guid 
 * @returns 
 */
export async function getDriverDetails(guid: string): Promise<DriverDetailsDto | null> {
    const driver = await prisma.driver.findUnique({
        where: { guid },
        include: {
            results: {
                include: {
                    session: {
                        select: {
                            type: true,
                            date: true,
                            eventId: true,
                        }
                    }
                }
            },
            ratings: {
                where: { tookPart: true },
                select: { eventId: true }
            }
        }
    });

    if (!driver) {
        return null;
    }

    const uniqueEventIds = new Set(driver.ratings.map(r => r.eventId));
    const eventsCount = uniqueEventIds.size;

    let lastActive: Date | null = null;
    if (driver.results.length > 0) {
        const dates = driver.results.map(r => new Date(r.session.date).getTime());
        lastActive = new Date(Math.max(...dates));
    }

    const qualiResults = driver.results.filter(
        r => r.session.type === 'QUALIFY' && r.finish !== null
    );
    const avgQualiPosition = qualiResults.length > 0
        ? Number((qualiResults.reduce((acc, r) => acc + (r.finish!), 0) / qualiResults.length).toFixed(2))
        : null;

    const raceFinishResults = driver.results.filter(
        r => r.session.type === 'RACE' && r.finish !== null
    );
    const avgFinishPosition = raceFinishResults.length > 0
        ? Number((raceFinishResults.reduce((acc, r) => acc + (r.finish!), 0) / raceFinishResults.length).toFixed(2))
        : null;

    const validPositionsGainedResults = driver.results.filter(
        r => r.session.type === 'RACE' && r.start !== null && r.finish !== null
    );
    const avgPositionsGained = validPositionsGainedResults.length > 0
        ? Number((validPositionsGainedResults.reduce((acc, r) => acc + (r.start! - r.finish!), 0) / validPositionsGainedResults.length).toFixed(2))
        : null;

    return {
        guid: driver.guid,
        mainName: driver.mainName,
        altNames: driver.altNames,
        currentRating: driver.currentRating,
        bestRating: driver.bestRating,
        combo: driver.combo,
        erosion: Math.max(0, driver.erosion - RATING_CONFIG.erosionStart - 1),
        joined: driver.joined,
        lastActive,
        stats: {
            eventsCount,
            avgQualiPosition,
            avgFinishPosition,
            avgPositionsGained,
        }
    };
}

/**
 * 
 * @param skip 
 * @param take 
 * @param search 
 * @param sortBy 
 * @returns 
 */
export async function getPaginatedDriversList(
    skip: number = 0,
    take: number = 20,
    search?: string,
    sortBy: DriverSortOption = 'RATING_DESC'
): Promise<PaginatedDriversResult> {
    const searchPattern = search && search.trim().length > 0
        ? `%${search.trim().toLowerCase()}%`
        : null;

    const fetchLimit = take + 1;

    let orderBySql: Prisma.Sql;

    switch (sortBy) {
        case 'NAME_ASC':
            orderBySql = Prisma.sql`LOWER(d.mainName) ASC`;
            break;
        case 'NAME_DESC':
            orderBySql = Prisma.sql`LOWER(d.mainName) DESC`;
            break;
        case 'RATING_ASC':
            orderBySql = Prisma.sql`d.currentRating ASC, d.mainName ASC`;
            break;
        case 'RATING_DESC':
            orderBySql = Prisma.sql`d.currentRating DESC, d.mainName ASC`;
            break;
        case 'BEST_RATING_DESC':
            orderBySql = Prisma.sql`d.bestRating DESC, d.currentRating DESC`;
            break;
        case 'BEST_RATING_ASC':
            orderBySql = Prisma.sql`d.bestRating ASC, d.currentRating ASC`;
            break;
        case 'LAST_ACTIVE_DESC':
            orderBySql = Prisma.sql`MAX(s.date) DESC, d.currentRating DESC`;
            break;
        default:
            orderBySql = Prisma.sql`d.currentRating DESC, d.mainName ASC`;
    }

    const rawDrivers = await prisma.$queryRaw<DriverListItemDto[]>`
        SELECT 
            d.guid, 
            d.mainName, 
            d.altNames, 
            d.currentRating, 
            d.bestRating,
            d.combo,
            d.erosion,
            MAX(s.date) AS lastActive
        FROM Driver d
        LEFT JOIN Result r ON d.guid = r.driverGuid
        LEFT JOIN Session s ON r.sessionId = s.id
        WHERE 
            ${searchPattern} IS NULL 
            OR LOWER(d.mainName) LIKE ${searchPattern}
            OR LOWER(d.altNames) LIKE ${searchPattern}
        GROUP BY 
            d.guid, 
            d.mainName, 
            d.altNames, 
            d.currentRating, 
            d.bestRating, 
            d.combo,
            d.erosion
        ORDER BY ${orderBySql}
        LIMIT ${fetchLimit} OFFSET ${skip}
    `;

    const hasMore = rawDrivers.length > take;
    const slicedDrivers = hasMore ? rawDrivers.slice(0, take) : rawDrivers;

    // Mapujemy erozję – zwracamy tylko nadwyżkę ponad erosionStart
    const drivers = slicedDrivers.map((driver) => {
        const activeErosion = driver.erosion > RATING_CONFIG.erosionStart
            ? driver.erosion - RATING_CONFIG.erosionStart
            : 0;

        return {
            ...driver,
            erosion: activeErosion, // Frontend dostanie np. 1 (jeśli erozja wynosiła 11) lub 0 (jeśli < 10)
        };
    });

    return {
        drivers,
        nextSkip: hasMore ? skip + take : null,
        hasMore,
    };
}

