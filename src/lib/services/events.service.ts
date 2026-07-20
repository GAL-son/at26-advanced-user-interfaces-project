"use server"

import { prisma } from '@/lib/db/db';
import type { AcsmRaceResult } from '@/lib/services/acsm/types';

export interface Event {
    name: string; 
    id: string; 
    championshipId: string | null; 
    track: string; 
    date: Date; 
    server: string;
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
    id: string;
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
                id: result.id,
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

export async function getAllEventsChronologically(): Promise<EventListDto[]> {
    const events = await prisma.event.findMany({
        orderBy: {
            date: 'asc' // Od najstarszego do najnowszego
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
                    date: 'asc' // Sesje wewnątrz wydarzenia również chronologicznie
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

    // Mapujemy strukturę dokładnie tak samo jak w getEventById, spłaszczając driver.mainName
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