"use server"

import { prisma } from '@/lib/db/db';
import type { AcsmRaceResult } from '@/lib/services/acsm/types';

export interface RaceResultSummaryDto {
    finish: number | null;
    positionChange: number | null; // null for quali
}

export interface DriverEventSummaryDto {
    driverGuid: string;
    driverName: string;
    car: string,
    quali: {
        finish: number | null;
    } | null;
    races: RaceResultSummaryDto[];
    rating: {
        after: number;
        change: number;
    } | null;
}

export interface EventDetailsDto {
    id: string;
    name: string;
    championshipId: string | null;
    track: string;
    date: Date;
    server: string;
    stats: {
        racesCount: number;
        uniqueDriversCount: number;
    };
    results: DriverEventSummaryDto[];
    sessions: {
        date: Date;
        type: string;
        durationLaps: number | null;
        durationMinutes: number | null;
        results: {
            driverGuid: string;
            driverName: string;
            start: number | null;
            finish: number | null;
            laps: number;
            totalTime: number;
            bestLap: number;
            gap: number | null;
        }[];
    }[];
}

export async function getEventDetails(id: string): Promise<EventDetailsDto | null> {
    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            ratings: {
                select: {
                    driverGuid: true,
                    current: true,
                    previous: true,
                    tookPart: true
                }
            },
            sessions: {
                orderBy: { date: 'asc' },
                include: {
                    results: {
                        orderBy: {finish: "asc"},
                        include: {
                            driver: {
                                select: { mainName: true }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!event) {
        return null;
    }

    const raceSessions = event.sessions.filter(s => s.type === 'RACE');
    const racesCount = raceSessions.length;

    const uniqueDriverGuids = new Set<string>();
    event.sessions.forEach(session => {
        session.results.forEach(res => uniqueDriverGuids.add(res.driverGuid));
    });

    const driverResultsMap = new Map<string, DriverEventSummaryDto>();

    // Mapy pomocnicze
    const driverNamesMap = new Map<string, string>();
    const driverCarsMap = new Map<string, Set<string>>();

    // Zbieramy nazwy oraz unikalne auta dla każdego kierowcy ze wszystkich sesji
    event.sessions.forEach(session => {
        session.results.forEach(res => {
            if (!driverNamesMap.has(res.driverGuid)) {
                driverNamesMap.set(res.driverGuid, res.driver.mainName);
            }

            if (res.car) {
                if (!driverCarsMap.has(res.driverGuid)) {
                    driverCarsMap.set(res.driverGuid, new Set());
                }
                driverCarsMap.get(res.driverGuid)!.add(res.car);
            }
        });
    });

    const qualiSession = event.sessions.find(s => s.type === 'QUALIFY');

    uniqueDriverGuids.forEach(guid => {
        // Składamy unikalne auta w jeden ciąg tekstowy (rozdzielony przecinkami)
        const driverCarsSet = driverCarsMap.get(guid);
        const carString = driverCarsSet && driverCarsSet.size > 0
            ? Array.from(driverCarsSet).join(', ')
            : 'Unknown';

        let qualiData: { finish: number | null } | null = null;
        if (qualiSession) {
            const qualiRes = qualiSession.results.find(r => r.driverGuid === guid);
            qualiData = { finish: qualiRes?.finish ?? null };
        }

        const racesData: RaceResultSummaryDto[] = raceSessions.map(raceSession => {
            const raceRes = raceSession.results.find(r => r.driverGuid === guid);

            if (!raceRes) {
                return { finish: null, positionChange: null };
            }

            const positionChange = (raceRes.start !== null && raceRes.finish !== null)
                ? raceRes.start - raceRes.finish
                : null;

            return {
                finish: raceRes.finish,
                positionChange
            };
        });

        const driverRating = event.ratings.find(r => r.driverGuid === guid && r.tookPart);
        const ratingData = driverRating ? {
            after: driverRating.current,
            change: driverRating.current - driverRating.previous
        } : null;

        driverResultsMap.set(guid, {
            driverGuid: guid,
            driverName: driverNamesMap.get(guid) || 'Unknown Driver',
            car: carString, // Zwracamy auto/auta w ogólnych wynikach
            quali: qualiData,
            races: racesData,
            rating: ratingData
        });
    });

    const summaryResults = Array.from(driverResultsMap.values());

    // W poszczególnych wynikach sesji nie przekazujemy już pola `car`
    const formattedSessions = event.sessions.map(session => ({
        date: session.date,
        type: session.type,
        durationLaps: session.durationLaps,
        durationMinutes: session.durationMinutes,
        results: session.results.map(res => ({
            driverGuid: res.driverGuid,
            driverName: res.driver.mainName,
            start: res.start,
            finish: res.finish,
            laps: res.laps,
            totalTime: res.totalTime,
            bestLap: res.bestLap,
            gap: res.gap
        }))
    }));

    return {
        id: event.id,
        name: event.name,
        championshipId: event.championshipId,
        track: event.track,
        date: event.date,
        server: event.server,
        stats: {
            racesCount,
            uniqueDriversCount: uniqueDriverGuids.size
        },
        results: summaryResults,
        sessions: formattedSessions
    };
}

export interface EventDto {
    name: string;
    championshipId: string | null;
    track: string;
    date: Date;
    server: string;
    sessions: SessionDto[];
}

export interface SessionDto {
    id: string;
    date: Date;
    type: string;
    durationLaps: number | null;
    durationMinutes: number | null;
    results: ResultDto[];
}

export interface ResultDto {
    driverGuid: string;
    driverName: string; // Spłaszczone pole z Driver.mainName
    start: number | null;
    finish: number | null;
    car: string;
    laps: number;
    totalTime: number;
    bestLap: number;
    gap: number | null;
}

export interface EventListDto {
    id: string,
    name: string;
    championshipId: string | null;
    track: string;
    date: Date;
    server: string;
    sessions: SessionDto[];
}

export async function getEventById(id: string): Promise<EventDto | null> {
    const event = await prisma.event.findUnique({
        where: { id: id },
        select: {
            name: true,
            championshipId: true,
            track: true,
            date: true,
            server: true,
            sessions: {
                select: {
                    date: true,
                    type: true,
                    durationLaps: true,
                    durationMinutes: true,
                    results: {
                        select: {
                            driverGuid: true,
                            start: true,
                            finish: true,
                            car: true,
                            laps: true,
                            totalTime: true,
                            bestLap: true,
                            gap: true,
                            driver: {
                                select: {
                                    mainName: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!event) {
        return null;
    }    

    return {
        ...event,
        sessions: event.sessions.map(session => ({
            ...session,
            results: session.results.map(result => ({
                driverGuid: result.driverGuid,
                driverName: result.driver.mainName, // Używamy pobranego mainName
                start: result.start,
                finish: result.finish,
                car: result.car,
                laps: result.laps,
                totalTime: result.totalTime,
                bestLap: result.bestLap,
                gap: result.gap
            }))
        }))
    } as unknown as EventDto;
}

/**
 * 
 * @returns 
 */
export async function getAllEventsChronologically(): Promise<EventListDto[]> {
    const events = await prisma.event.findMany({
        orderBy: {
            date: 'asc' 
        },
        select: {
            id: true,
            name: true,
            championshipId: true,
            track: true,
            date: true,
            server: true,
            sessions: {
                orderBy: {
                    date: 'asc' 
                },
                select: {
                    id: true,
                    date: true,
                    type: true,
                    durationLaps: true,
                    durationMinutes: true,
                    results: {
                        select: {
                            id: true,
                            driverGuid: true,
                            start: true,
                            finish: true,
                            car: true,
                            laps: true,
                            totalTime: true,
                            bestLap: true,
                            gap: true,
                            driver: {
                                select: {
                                    mainName: true,
                                    currentRating: true,
                                    bestRating: true,
                                    combo: true,
                                    erosion: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    return events.map(event => ({
        id: event.id,
        name: event.name,
        championshipId: event.championshipId,
        track: event.track,
        date: event.date,
        server: event.server,
        sessions: event.sessions.map(session => ({
            id: session.id,
            date: session.date,
            type: session.type,
            durationLaps: session.durationLaps,
            durationMinutes: session.durationMinutes,
            results: session.results.map(result => ({
                id: result.id,
                driverGuid: result.driverGuid,
                driverName: result.driver.mainName,
                start: result.start,
                finish: result.finish,
                car: result.car,
                laps: result.laps,
                totalTime: result.totalTime,
                bestLap: result.bestLap,
                gap: result.gap
            }))
        }))
    })) as unknown as EventListDto[];

    
}

// SYNC

export interface Event {
    name: string; 
    id: string; 
    championshipId: string | null; 
    track: string; 
    date: Date; 
    server: string;
}

/**
 * 
 * @param id 
 * @param server 
 * @param acsmEvent 
 * @returns 
 */
export async function syncEventFromAcsm(id: string, server: string, acsmEvent: AcsmRaceResult): Promise<Event> {
    const newDate = new Date(acsmEvent.Date);

    const existingEvent = await prisma.event.findUnique({
        where: { id: id },
        select: { date: true }
    });

    const resolvedDate = existingEvent 
        ? new Date(Math.min(existingEvent.date.getTime(), newDate.getTime()))
        : newDate;

    return await prisma.event.upsert({
        where: { id: id },
        update: { 
            date: resolvedDate 
        }, 
        create: { 
            id: id,
            championshipId: acsmEvent.ChampionshipID || null,
            name: acsmEvent.EventName,
            track: acsmEvent.TrackConfig 
                ? `${acsmEvent.TrackName} (${acsmEvent.TrackConfig})` 
                : acsmEvent.TrackName,
            server: server,
            date: resolvedDate,
        }            
    });
}