import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ guid: string }> }
) {
    try {
        const { guid } = await params;

        // Pobieramy profil kierowcy z optymalnymi podzapytaniami
        const driver = await prisma.driver.findUnique({
            where: { guid },
            select: {
                guid: true,
                mainName: true,
                altNames: true,
                combo: true,
                currentElo: true,
                // 1. Pobieramy tylko ilość wyścigów bezpośrednio z bazy
                _count: {
                    select: { raceResult: true }
                },
                // 2. Pobieramy TYLKO JEDEN, najnowszy wyścig, żeby wyciągnąć jego datę
                raceResult: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { createdAt: true }
                }
            }
        });

        if (!driver) {
            return NextResponse.json({ success: false, error: "Kierowca nie został znaleziony" }, { status: 404 });
        }

        // 3. Wyciągamy datę ostatniego wyścigu (jeśli kierowca w ogóle w jakimś jechał)
        const lastRaceDate = driver.raceResult[0]?.createdAt;

        const formattedDriver = {
            guid: driver.guid,
            mainName: driver.mainName,
            altNames: driver.altNames,
            combo: Number(driver.combo),
            currentElo: Number(driver.currentElo),
            racesCount: driver._count.raceResult, // Liczba wyścigów z agregacji _count
            lastRaced: lastRaceDate ? new Date(lastRaceDate).toISOString() : null
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