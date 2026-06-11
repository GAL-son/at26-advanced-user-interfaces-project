// src/app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pobieramy parametry z URL, ustawiamy domyślny limit na 10
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const cursor = searchParams.get('cursor'); // ID wyścigu, od którego zaczynamy

    const events = await prisma.event.findMany({
      take: limit + 1, // Pobieramy jeden element więcej, żeby sprawdzić, czy jest kolejna strona
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: {
        date: 'desc',
      },
    });

    // Sprawdzamy, czy istnieje kolejna paczka danych
    let nextCursor: string | null = null;
    if (events.length > limit) {
      const nextItem = events.pop(); // Usuwamy nadprogramowy element
      nextCursor = nextItem!.id;     // Jego ID staje się kolejnym kursorem
    }

    return NextResponse.json({
      success: true,
      data: events.map(event => ({
        id: event.id,
        name: event.name,
        track: event.track,
        date: event.date.toISOString(),
        laps: event.laps,
        time: event.time,
        server: event.server,
        processed: event.processed,
      })),
      nextCursor: nextCursor, // Zwracamy frontendowi informację, skąd ma pobierać dalej
    });
    
  } catch (error: any) {
    console.error("[API Events] Paginacja napotkała błąd:", error);
    return NextResponse.json({
      success: false,
      error: "Nie udało się pobrać kolejnej paczki danych."
    }, { status: 500 });
  }
}