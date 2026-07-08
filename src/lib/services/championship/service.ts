"use server"

import { prisma } from '@/lib/db/db';
import type { AcsmChampionshipInfo } from '@/lib/services/acsm/types';

export interface ChampionshipDto {
  id: string;
  name: string;
}

export async function getAllChampionships(): Promise<ChampionshipDto[]> {
  return await prisma.championship.findMany();
}

export async function getChampionshipsList(skip: number, take: number, search?: string): Promise<ChampionshipDto[]>  {
  let whereClause: any = undefined;

  if (search) {
    const isProduction = process.env.NODE_ENV === 'production';

    whereClause = {
      name: {
        contains: search,
        ...(isProduction && { mode: 'insensitive' })
      }
    };
  }

  return await prisma.championship.findMany({
    skip,
    take,
    where: whereClause,
    orderBy: { name: 'asc' }
  });
}

/**
 * Sync championship data from ACSM
 */
export async function syncChampionshipFromAcsm(acsmChamp: AcsmChampionshipInfo): Promise<ChampionshipDto>  {
  return await prisma.championship.upsert({
    where: { id: acsmChamp.id },
    update: { name: acsmChamp.name },
    create: { 
      id: acsmChamp.id, 
      name: acsmChamp.name 
    },
  });
}