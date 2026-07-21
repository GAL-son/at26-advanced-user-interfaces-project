"use server"
import { prisma } from '@/lib/db/db';
import { Prisma } from '@prisma/client';

export interface Driver { 
    guid: string; 
    mainName: string; 
    altNames: string | null; 
    currentRating: number; 
    combo: number; 
}

export type DriverSortOption = 
  | 'NAME_ASC' 
  | 'NAME_DESC' 
  | 'RATING_DESC' 
  | 'RATING_ASC' 
  | 'BEST_RATING_DESC'
  | 'BEST_RATING_ASC'
  | 'LAST_ACTIVE_DESC';

export interface DriverListItemDto { 
    guid: string; 
    mainName: string; 
    altNames: string | null; 
    currentRating: number; 
    bestRating: number;
    combo: number; 
    lastActive: Date | null;
}

export interface PaginatedDriversResult {
    drivers: DriverListItemDto[];
    nextSkip: number | null;
    hasMore: boolean;
}

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
            d.combo
        ORDER BY ${orderBySql}
        LIMIT ${fetchLimit} OFFSET ${skip}
    `;

    const hasMore = rawDrivers.length > take;
    const drivers = hasMore ? rawDrivers.slice(0, take) : rawDrivers;
    const nextSkip = hasMore ? skip + take : null;

    return {
        drivers,
        nextSkip,
        hasMore
    };
}

export async function syncDriverFromAcsm(guid: string, name: string, rating: number, joined: Date): Promise<Driver> {
    const existingDriver = await prisma.driver.findUnique({
        where: { guid: guid },
        select: { mainName: true, altNames: true }
    });

    let newAltNames = existingDriver?.altNames?.split(',') ?? [];
    if (existingDriver && existingDriver.mainName != name) {
        newAltNames = [... new Set([...newAltNames, existingDriver.mainName])]
    }

    const altNames = (newAltNames.length == 0) ? null : newAltNames.join(",");

    return await prisma.driver.upsert({
        where: { guid: guid },
        update: {
            mainName: name,
            altNames: altNames
        },
        create: {
            guid: guid,
            mainName: name,
            altNames: null,
            currentRating: rating,
            joined: joined
        }
    });
}