"use server"

import { prisma } from '@/lib/db/db';
import type { AcsmRaceResult } from '@/lib/services/acsm/types';

export async function syncDriverFromAcsm(guid: string, name: string, rating: number): Promise<Session> {
    const existingDriver = await prisma.driver.findUnique({
        where: { guid: guid },
        select: { mainName: true, altNames: true }
    });

    const newName = name;
    let newAltNames = existingDriver?.altNames?.split(',') ?? [];

    if (existingDriver && existingDriver.mainName !== name) {
        newAltNames = [... new Set([...newAltNames, name])]
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
        }
    });


    // return await prisma.driver.upsert({
    //     where: {
    //         guid: guid
    //     },
    //     update: {
    //         name: name,
    //         altNames: append old name to it
    //     },
    //     create: {
    //         eventId: eventId,
    //         date: new Date(acsmEvent.Date),
    //         type: acsmEvent.Type,
    //         durationLaps: acsmEvent.SessionConfig.laps,
    //         durationMinutes: acsmEvent.SessionConfig.time,
    //     }
    // });
}