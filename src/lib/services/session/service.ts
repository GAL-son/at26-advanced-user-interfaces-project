"use server"

import { prisma } from '@/lib/db/db';
import type { AcsmRaceResult } from '@/lib/services/acsm/types';

export interface Session {
    id: string; 
    eventId: string; 
    date: Date; 
    type: string; 
    durationLaps: number | null; 
    durationMinutes: number | null;
}

export async function syncSessionFromAcsm(eventId: string, acsmEvent: AcsmRaceResult): Promise<Session> {
    return await prisma.session.upsert({
        where: {
            // Prisma generuje specjalny obiekt dla unikalnych kluczy złożonych
            eventId_date: {
                eventId: eventId,
                date: new Date(acsmEvent.Date),
            },
        },
        update: {},
        create: {
            eventId: eventId,
            date: new Date(acsmEvent.Date),
            type: acsmEvent.Type,
            durationLaps: acsmEvent.SessionConfig.laps,
            durationMinutes: acsmEvent.SessionConfig.time,
        }
    });
}