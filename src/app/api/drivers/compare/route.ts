import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Pobierz listę guid graczy z parametrów URL
        const guidsParam = searchParams.get('guids');
        if (!guidsParam) {
            return NextResponse.json({ success: false, error: 'Guids parameter is required' }, { status: 400 });
        }

        const guids = guidsParam.split(',');

        // Pobierz paginację z parametrów URL
        const page = parseInt(searchParams.get('page') || '0', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const offset = page * limit;

        // Pobierz historię wyników dla każdego gracza z paginacją
        const raceResultsPromises = guids.map(async guid => {
            const results = await prisma.raceResult.findMany({
                where: { driverGuid: guid },
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit,
                select: {
                    id: true,
                    eloBefore: true,
                    eloAfter: true,
                    createdAt: true,
                    combo: true,
                    driver: true
                }
            });

            // Tutaj tworzymy płaski obiekt tymczasowy zawierający meta-dane kierowcy,
            // aby móc go potem łatwo pogrupować w pętli forEach.
            return results.map(item => {
                const before = item.eloBefore ?? 1000;
                const after = item.eloAfter ?? 1000;
                const change = after - before;

                return {
                    // Zostawiamy te pola tutaj tylko do celów grupowania
                    _driverGuid: item.driver.guid,
                    _driverName: item.driver.mainName,
                    // Właściwe dane wyścigu
                    id: item.id,
                    elo: Number(after),
                    eloChange: Number(change),
                    createdAt: item.createdAt.toISOString(),
                    combo: item.combo
                };
            });
        });

        const raceResults = await Promise.all(raceResultsPromises);

        // Grupuj wyniki według gracza
        const groupedResults: { [key: string]: { name: string; data: any[] } } = {};
        
        raceResults.forEach(results => {
            results.forEach(result => {
                const { _driverGuid, _driverName, ...cleanRaceData } = result;

                if (!groupedResults[_driverGuid]) {
                    groupedResults[_driverGuid] = {
                        name: _driverName,
                        data: []
                    };
                }
                // Pushujemy czyste dane (bez powtarzającego się guid i name)
                groupedResults[_driverGuid].data.push(cleanRaceData);
            });
        });

        // Przekształć grupowane wyniki do pożądanego formatu końcowego
        const formattedResults = Object.entries(groupedResults).map(([guid, group]) => ({
            guid,
            name: group.name,
            data: group.data
        }));
        
        const hasMore = raceResults.flat().length === limit * guids.length;

        return NextResponse.json({
            success: true,
            data: formattedResults,
            hasMore,
            nextPage: hasMore ? page + 1 : null
        });

    } catch (error: any) {
        console.error("[Driver Compare Elo API Error]:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}