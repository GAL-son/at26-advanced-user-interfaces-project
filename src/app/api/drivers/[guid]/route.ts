import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ guid: string }> }
) {
    try {
        const { guid } = await params;

        // Pobieramy profil oraz agregujemy statystyki z EloHistory
        const drivers = await prisma.$queryRaw<any[]>`
            SELECT 
                d.guid,
                d.mainName,
                d.altNames,
                d.combo,
                d.currentElo,
                COUNT(eh.id) as racesCount,
                MAX(eh.createdAt) as lastRaced
            FROM "Driver" d
            LEFT JOIN "EloHistory" eh ON eh.driverGuid = d.guid
            WHERE d.guid = ${guid}
            GROUP BY d.guid, d.mainName, d.altNames, d.combo, d.currentElo
        `;

        if (!drivers || drivers.length === 0) {
            return NextResponse.json({ success: false, error: "Kierowca nie został znaleziony" }, { status: 404 });
        }

        const driver = drivers[0];

        const formattedDriver = {
            guid: driver.guid,
            mainName: driver.mainName,
            altNames: driver.altNames,
            combo: Number(driver.combo),
            currentElo: Number(driver.currentElo),
            racesCount: Number(driver.racesCount),
            lastRaced: driver.lastRaced ? new Date(driver.lastRaced).toISOString() : null
        };

        return NextResponse.json({
            success: true,
            driver: formattedDriver
        });

    } catch (error: any) {
        console.error("[Driver Profile API Error]:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}