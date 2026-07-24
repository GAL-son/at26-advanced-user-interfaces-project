"use server"

import { prisma } from '@/lib/db/db';

import { RATING_CONFIG } from '@/lib/config/rating.config';

import {
    DriverRatingHistoryGroupDto,
    DriverRatingHistoryResponseDto,
    DriverRatingPointDto
} from "../ratings.types";

/**
 * 
 * @param guids 
 * @param page 
 * @param limit 
 * @returns 
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
                    erosion: true,
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
                        erosion: Math.max(0, baseErosion - RATING_CONFIG.erosionStart),
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