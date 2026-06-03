import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ guid: string }> }
) {
    try {
        const { guid } = await params;
        const { searchParams } = new URL(request.url);
        
        const page = parseInt(searchParams.get('page') || '0', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const offset = page * limit;

        // Pobieramy historię elo. W SQLite nazwy kolumn wielką literą w cudzysłowie
        // są wymagane, jeśli Prisma wygenerowała je camelCase w bazie (np. "driverGuid")
        const eloHistory = await prisma.$queryRaw<any[]>`
            SELECT 
                id,
                "eloAfter",
                "eloChange",
                "createdAt"
            FROM "EloHistory"
            WHERE "driverGuid" = ${guid}
            ORDER BY "createdAt" DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        const formattedHistory = eloHistory.map(item => ({
            id: item.id,
            elo: Number(item.eloAfter),
            eloChange: Number(item.eloChange),
            createdAt: item.createdAt
        }));

        const hasMore = formattedHistory.length === limit;

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