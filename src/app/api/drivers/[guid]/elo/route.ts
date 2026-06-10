import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ guid: string }> } // 1. params jako Promise (Next.js 15)
) {
    try {
        const { guid } = await params; // 2. Odpakowanie guid za pomocą await
        const { searchParams } = new URL(request.url);
        
        const page = parseInt(searchParams.get('page') || '0', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const offset = page * limit;

        // Pobieramy historię wyników z RaceResult
        const raceResults = await prisma.raceResult.findMany({
            where: { driverGuid: guid },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit,
            select: {
                id: true,
                eloBefore: true, // Potrzebne do obliczenia zmiany
                eloAfter: true,
                createdAt: true,
                combo: true,
            }
        });

        // 3. Obliczamy eloChange dynamicznie podczas mapowania
        const formattedHistory = raceResults.map(item => {
            const before = item.eloBefore ?? 1000; // fallback, jeśli pole byłoby nullem
            const after = item.eloAfter ?? 1000;
            const change = after - before;

            return {
                id: item.id,
                elo: Number(after),
                eloChange: Number(change), // Obliczona wartość
                createdAt: item.createdAt.toISOString(),
                combo: item.combo
            };
        });

        const hasMore = raceResults.length === limit;

        return NextResponse.json({
            success: true,
            data: formattedHistory,
            hasMore,
            nextPage: hasMore ? page + 1 : null
        });

    } catch (error: any) {
        console.error("[Driver Elo History API Error]:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}