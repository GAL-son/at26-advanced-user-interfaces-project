import { prisma } from '@/lib/db/db';

import { AcsmRaceResult } from '@/features/acsm/acsm.types';

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