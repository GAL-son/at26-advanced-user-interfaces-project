import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Upewnij się, że ten import istnieje dla wyszukiwania eventu
import { getEventEloResults } from '@/lib/services/eventEloService';

// Zmieniamy typowanie params na Promise, zgodnie z wymogami nowego Next.js
export async function GET(
    request: Request, 
    { params }: { params: Promise<{ id: string }> } 
) {
    try {
        // 🟢 Kluczowa poprawka: Rozpakowujemy Promise za pomocą await
        const resolvedParams = await params;
        const id = resolvedParams.id;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Missing ID parameter' }, { status: 400 });
        }

        // 1. Szukamy wyścigu w bazie danych, żeby wyciągnąć resultsJsonUrl
        const dbEvent = await prisma.event.findUnique({
            where: { id }
        });

        if (!dbEvent) {
            return NextResponse.json({ success: false, error: 'Event not found in database' }, { status: 404 });
        }

        // 2. Pobieramy plik wynikowy JSON z ACSM
        const acsmRes = await fetch(dbEvent.resultsJsonUrl, { cache: 'no-store' });
        if (!acsmRes.ok) throw new Error('Failed to fetch ACSM JSON');
        const acsmData = await acsmRes.json();

        // 3. Wyciągamy z bazy przeliczone punkty ELO dla tego wyścigu
        const eloRecords = await getEventEloResults(id);
        const eloMap = new Map(eloRecords.map(r => [r.driverGuid, r]));

        // 4. Konstruujemy obiekt informacyjny
        const info = {
            track: acsmData.TrackName || dbEvent.track,
            date: acsmData.Date || dbEvent.date,
            server: dbEvent.server
        };

        // 5. Mapujemy wyniki
        const results = (acsmData.Result || []).map((row: any) => {
            const guid = row.DriverGuid?.trim();
            const eloData = eloMap.get(guid);

            return {
                driverGuid: guid,
                driverName: row.DriverName,
                carModel: row.CarModel,
                numLaps: row.NumLaps,
                totalTime: row.TotalTime,
                bestLap: row.BestLap,
                eloBefore: eloData ? eloData.eloBefore : 1000,
                eloAfter: eloData ? eloData.eloAfter : 1000,
                eloChange: eloData ? eloData.eloChange : 0,
                combo: eloData ? eloData.combo : 0
            };
        });

        return NextResponse.json({
            success: true,
            info,
            results
        });

    } catch (error: any) {
        console.error('[Event API Error]:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}