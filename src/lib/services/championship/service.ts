"use server"

import { prisma } from '@/lib/db/db';
import type { AcsmChampionshipInfo } from '@/lib/services/acsm/types';

/**
 * Sync championship data from ACSM
 */
export async function syncChampionshipFromAcsm(acsmChamp: AcsmChampionshipInfo) {
  return await prisma.championship.upsert({
    where: { id: acsmChamp.id },
    update: { name: acsmChamp.name },
    create: { 
      id: acsmChamp.id, 
      name: acsmChamp.name 
    },
  });
}