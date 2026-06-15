import { prisma } from '@/lib/db/db';

export interface FormattedEvent {
  id: string;
  name: string;
  server: string;
  track: string;
  date: string; // ISO String 
  jsonUrl: string;
}

export async function getLatestEvents(limit = 2): Promise<FormattedEvent[]> {
  try {
    const events = await prisma.event.findMany({
      take: limit,
      orderBy: {
        date: 'desc', // Sortujemy od najnowszych wydarzeń
      },
      select: {
        id: true,
        name: true,
        server: true,
        track: true,
        date: true,
      },
    });

    return events.map((event) => ({
      id: event.id,
      name: event.name,
      server: event.server,
      track: event.track,
      date: event.date.toISOString(),
      jsonUrl: '', // Fallback, ponieważ model Event nie posiada tego pola w bazie
    }));
  } catch (error) {
    console.error("[Get Latest Events Service Error]:", error);
    return [];
  }
}