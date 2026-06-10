// src/app/api/events/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/db';
import { Event, RaceResult, Driver } from '@/lib/db/types';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Missing ID parameter' }, { status: 400 });
        }

        // Pobieramy event z bazy razem z relacjami
        const dbEvent = await prisma.event.findUnique({
            where: { id },
            include: {
                raceResult: {
                    include: {
                        driver: true,
                    },
                },
            },
        });

        if (!dbEvent) {
            return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
        }

        // Mapujemy tablicę wyników na pełne instancje klasy RaceResult
        const raceResultsInstances = dbEvent.raceResult.map((result) => {
            const driverInstance = new Driver(
                result.driver.guid,
                result.driver.mainName,
                result.driver.altNames,
                result.driver.currentElo,
                result.driver.combo
            );

            return new RaceResult({
                ...result,
                // totalTime i bestLap w Prisma to Float (number w JS), pasuje idealnie
                driver: driverInstance
            });
        });

        // Tworzymy pełną instancję klasy Event
        const eventInstance = new Event(
            dbEvent.id,
            dbEvent.name,
            dbEvent.track,
            dbEvent.date,
            dbEvent.server,
            dbEvent.processed,
            dbEvent.laps ?? undefined,
            dbEvent.time ?? undefined,
            raceResultsInstances
        );

        // Zwracamy czysty obiekt JSON (gettery Next.js zserializuje automatycznie, jeśli są potrzebne na froncie, 
        // ale w JSONie polecą tylko surowe właściwości)
        return NextResponse.json({ 
            success: true, 
            data: eventInstance 
        });

    } catch (error: any) {
        console.error('[Event API Error]:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}