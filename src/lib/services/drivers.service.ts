"use server"
import { prisma } from '@/lib/db/db';
import { Prisma } from '@prisma/client';

import { RATING_CONFIG } from "@/lib/config/rating.config";

export interface Driver {
    guid: string;
    mainName: string;
    altNames: string | null;
    currentRating: number;
    combo: number;
}

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
        erosion: driver.erosion,
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

export interface DriverDetailsDto {
    guid: string;
    mainName: string;
    altNames: string | null;
    currentRating: number;
    bestRating: number;
    combo: number;
    erosion: number;
    joined: Date;
    lastActive: Date | null;
    stats: {
        eventsCount: number;
        avgQualiPosition: number | null;
        avgFinishPosition: number | null;
        avgPositionsGained: number | null;
    };
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
    erosion: number;
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

export interface DriverRatingPointDto {
    eventId: string;
    eventName: string;
    eventDate: string;
    hasRaced: boolean;
    id: string | null;
    elo: number;
    eloChange: number;
    combo: number;
    erosion: number;
}

export interface DriverRatingHistoryGroupDto {
    guid: string;
    name: string;
    data: DriverRatingPointDto[];
}

export interface DriverRatingHistoryResponseDto {
    data: DriverRatingHistoryGroupDto[];
    hasMore: boolean;
    nextPage: number | null;
}

/**
 * Pobiera historię zmian ratingu dla podanych kierowców per Event z 2-eventowym marginesem przed datą joined
 */
export async function getDriverRatingHistory(
    guids: string[],
    page: number = 0,
    limit: number = 50
): Promise<DriverRatingHistoryResponseDto> {
    if (!guids || guids.length === 0) {
        return { data: [], hasMore: false, nextPage: null };
    }

    const offset = page * limit;

    // 1. Pobieramy profile kierowców wraz z ich datą `joined`
    const drivers = await prisma.driver.findMany({
        where: { guid: { in: guids } },
        select: { guid: true, mainName: true, joined: true }
    });

    if (drivers.length === 0) {
        return { data: [], hasMore: false, nextPage: null };
    }

    const driverNamesMap = new Map(drivers.map(d => [d.guid, d.mainName]));

    // Najwcześniejsza data joined spośród graczy
    const earliestJoinedDate = new Date(
        Math.min(...drivers.map(d => new Date(d.joined).getTime()))
    );

    // 2. Szukamy drugiego wyścigu Przed datą joined (dla marginesu 2 eventów na wykresie)
    const marginEventsBeforeJoined = await prisma.event.findMany({
        where: {
            date: { lt: earliestJoinedDate }
        },
        orderBy: { date: 'desc' },
        take: 2,
        select: { id: true, date: true }
    });

    // Ustalamy datę graniczną: jeśli znaleźliśmy wyścigi przed `joined`, 
    // bierzemy datę najstarszego z nich jako nasz wyznacznik marginesu
    const cutoffDate = marginEventsBeforeJoined.length > 0
        ? marginEventsBeforeJoined[marginEventsBeforeJoined.length - 1].date
        : earliestJoinedDate;

    // 3. Pobieramy globalną listę eventów
    const rawEvents = await prisma.event.findMany({
        orderBy: { date: 'desc' },
        skip: offset,
        take: limit,
        include: {
            ratings: {
                where: { driverGuid: { in: guids } },
                select: {
                    id: true,
                    driverGuid: true,
                    current: true,
                    previous: true,
                    combo: true,
                    erosion:true,
                    tookPart: true
                }
            }
        }
    });

    // Filtrujemy eventy: odrzucamy tylko te starsze niż nasz ustalony margines (cutoffDate)
    const events = rawEvents.filter(
        event => new Date(event.date).getTime() >= new Date(cutoffDate).getTime()
    );

    // Inicjalizacja struktury grupującej
    const groupedResults: { [guid: string]: { name: string; data: DriverRatingPointDto[] } } = {};

    guids.forEach(guid => {
        groupedResults[guid] = {
            name: driverNamesMap.get(guid) || 'Unknown Driver',
            data: []
        };
    });

    // 4. Przetwarzamy odfiltrowane eventy
    for (const event of events) {
        const eventRatingsMap = new Map(event.ratings.map(r => [r.driverGuid, r]));

        await Promise.all(
            guids.map(async (guid) => {
                const rating = eventRatingsMap.get(guid);

                if (rating && rating.tookPart) {
                    // Scenariusz A: Kierowca brał udział w evencie
                    groupedResults[guid].data.push({
                        eventId: event.id,
                        eventName: event.name,
                        eventDate: event.date.toISOString(),
                        hasRaced: true,
                        id: rating.id,
                        elo: rating.current,
                        erosion: Math.max(0, rating.erosion - RATING_CONFIG.erosionStart),
                        eloChange: rating.current - rating.previous,
                        combo: rating.combo ?? 0
                    });
                } else {
                    // Scenariusz B: Kierowca NIE brał udziału w evencie
                    const lastRatingBefore = await prisma.rating.findFirst({
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
                            current: true,
                            combo: true,
                            erosion: true,
                        }
                    });

                    const baseElo = lastRatingBefore?.current ?? RATING_CONFIG.startingRating;
                    const baseCombo = 0;
                    const baseErosion = lastRatingBefore?.erosion ?? 0;

                    groupedResults[guid].data.push({
                        eventId: event.id,
                        eventName: event.name,
                        eventDate: event.date.toISOString(),
                        hasRaced: false,
                        id: rating?.id ?? null,
                        elo: baseElo,
                        erosion: Math.max(0, baseErosion- RATING_CONFIG.erosionStart),
                        eloChange: 0,
                        combo: baseCombo
                    });
                }
            })
        );
    }

    const formattedResults: DriverRatingHistoryGroupDto[] = Object.entries(groupedResults).map(([guid, group]) => ({
        guid,
        name: group.name,
        data: group.data
    }));

    // Określamy czy w tej paczce odrzuciliśmy starsze eventy przekraczające nasz 2-eventowy margines
    const hasFilteredOutOlderEvents = rawEvents.length > events.length;

    // `hasMore` będzie `true` tylko jeśli pobrano cały limit i nie dotarliśmy jeszcze do końca marginesu
    const hasMore = rawEvents.length === limit && !hasFilteredOutOlderEvents;

    return {
        data: formattedResults,
        hasMore,
        nextPage: hasMore ? page + 1 : null
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