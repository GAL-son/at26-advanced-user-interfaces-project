// src/app/api/events/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/db';
import { Event as DisplayEvent } from '@/model/event'
import { Event } from '@/lib/db/types';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Missing ID parameter' }, { status: 400 });
        }

        // Pobranie surowych danych z bazy danych
        const dbEvent = await prisma.event.findUnique({
            where: { id },
            include: {
                raceResult: {
                    include: { driver: true },
                },
            },
        });

        if (!dbEvent) {
            return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
        }

        // 1. Konwersja raw result z bazy na klasę domenową Event za pomocą fabryki
        const eventDomain = DisplayEvent.fromPrisma(dbEvent as any);

        // 3. Zwrócenie gotowego i sformatowanego wyniku
        return NextResponse.json({
            success: true,
            ...eventDomain
        });

    } catch (error: any) {
        console.error('[Event API Error]:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}