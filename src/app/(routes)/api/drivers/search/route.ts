import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/db';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        // Jeśli parametr wyszukiwania jest pusty, zwracamy pustą listę zamiast całej bazy
        if (!query.trim()) {
            return NextResponse.json({
                success: true,
                results: []
            });
        }

        // Warunek wyszukiwania po nazwie głównej lub alternatywnych
        const where: Prisma.DriverWhereInput = {
            OR: [
                { mainName: { contains: query } },
                { altNames: { contains: query } }
            ]
        };

        // Pobieramy TYLKO niezbędne pola z bazy danych
        const matchedDrivers = await prisma.driver.findMany({
            where,
            take: 10, // Limit wyników dla podpowiedzi (możesz dostosować)
            select: {
                guid: true,
                mainName: true,
                currentElo: true,
            }
        });

        // Mapowanie na prosty format wyjściowy (nazwa i guid)
        const results = matchedDrivers.map(driver => ({
            guid: driver.guid,
            mainName: driver.mainName,
            currentElo: driver.currentElo,
        }));

        return NextResponse.json({
            success: true,
            results
        });

    } catch (error: any) {
        console.error("[Drivers Search API Error]:", error);
        return NextResponse.json(
            { success: false, error: error.message }, 
            { status: 500 }
        );
    }
}