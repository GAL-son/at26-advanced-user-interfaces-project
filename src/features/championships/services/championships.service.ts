"use server"

import { prisma } from '@/lib/db/db';
import type { AcsmChampionshipInfo } from '@/lib/services/acsm/types';
import type { ChampionshipListItemDto, ChampionshipEventDto, ChampionshipDto } from '@/features/championships/championships.types';

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

  if (!championship || championship.events.length < 1) {
    return null;
  }

  championship.events.forEach(
    (val, id, arr) => !val.name ? arr[id].name = championship.name + " @ " + val.track.replaceAll("_", " ") : val.name);

  return {
    ...championship,
    from: new Date(championship.events[0].date),
    to: new Date(championship.events[championship.events.length - 1].date)

  } as ChampionshipDto;
}

export async function getAllChampionships(): Promise<ChampionshipListItemDto[]> {
  return await prisma.championship.findMany();
}

export async function getChampionshipsList(
  skip: number,
  take: number,
  search?: string
): Promise<ChampionshipListItemDto[]> {

  // Przygotowujemy bezpieczny parametr dla obu baz (z małych liter dla LOWER)
  const searchPattern = search ? `%${search.toLowerCase()}%` : null;

  // Zapytanie zgodne ze standardem ANSI SQL - działa w SQLite oraz PostgreSQL
  const championships = await prisma.$queryRaw<any[]>`
    SELECT c.id, c.name FROM Championship c
    LEFT JOIN Event e ON c.id = e.championshipId
    WHERE 
      ${searchPattern} IS NULL 
      OR LOWER(c.name) LIKE ${searchPattern}
    GROUP BY c.id, c.name
    ORDER BY COALESCE(MAX(e.date), CAST('1970-01-01' AS TIMESTAMP)) DESC
    LIMIT ${take} OFFSET ${skip}
  `;

  return championships.map(c => ({
    id: c.id,
    name: c.name
  }));
}

/**
 * Sync championship data from ACSM
 */
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