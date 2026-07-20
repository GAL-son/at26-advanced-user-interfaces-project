"use server"

import { prisma } from '@/lib/db/db';
import type { AcsmChampionshipInfo } from '@/lib/services/acsm/types';

export interface ChampionshipListItemDto {
  id: string;
  name: string;
}

export interface ChampionshipEventDto {
    id: string; 
    name: string;
    track: string; 
    date: Date; 
    server: string;
}

export interface ChampionshipDto {
  name: string,
  events: ChampionshipEventDto[];
  from: Date
}


export async function getChampionship(championshipId: string): Promise<ChampionshipDto | null> {
  const championship = await prisma.championship.findUnique({
    where: { id: championshipId },
    select: {
      name: true,
      events: {
        select: {
          id: true,
          name: true,
          track: true,
          date: true,
          server: true
        }
      }
    }
  });

  if(!championship || championship.events.length < 1) {
    return null;
  }

  return {
    ...championship,
    from: new Date(championship.events[0].date),
    to: new Date(championship.events[championship.events.length - 1].date)

  } as ChampionshipDto;
}

export async function getAllChampionships(): Promise<ChampionshipListItemDto[]> {
  return await prisma.championship.findMany();
}

export async function getChampionshipsList(skip: number, take: number, search?: string): Promise<ChampionshipListItemDto[]>  {
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
export async function syncChampionshipFromAcsm(acsmChamp: AcsmChampionshipInfo): Promise<ChampionshipListItemDto>  {
  return await prisma.championship.upsert({
    where: { id: acsmChamp.id },
    update: { name: acsmChamp.name },
    create: { 
      id: acsmChamp.id, 
      name: acsmChamp.name 
    },
  });
}