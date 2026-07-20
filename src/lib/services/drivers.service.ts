"use server"

import { prisma } from '@/lib/db/db';

export interface Driver { 
    guid: string; 
    mainName: string; 
    altNames: string | null; 
    currentRating: number; 
    combo: number; 
}

export async function syncDriverFromAcsm(guid: string, name: string, rating: number): Promise<Driver> {
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
        }
    });
}