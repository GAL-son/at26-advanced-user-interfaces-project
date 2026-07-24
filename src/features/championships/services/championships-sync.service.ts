"use server"

import { prisma } from '@/lib/db/db';

import type { AcsmChampionshipInfo } from '@/lib/services/acsm/types';
import type {ChampionshipListItemDto} from '@/features/championships/championships.types';

export async function syncChampionshipFromAcsm(acsmChamp: AcsmChampionshipInfo): Promise<ChampionshipListItemDto> {
    return await prisma.championship.upsert({
        where: { id: acsmChamp.id },
        update: { name: acsmChamp.name },
        create: {
            id: acsmChamp.id,
            name: acsmChamp.name
        },
    });
}