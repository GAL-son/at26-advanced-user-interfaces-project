import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/db';
// import { processEventElo } from '@/lib/services/eventEloService';

export async function GET(request: Request) {
    // // 1. Zabezpieczenie Vercel Cron przed nieautoryzowanym dostępem z zewnątrz
    // const authHeader = request.headers.get('authorization');
    // if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response('Unauthorized', { status: 401 });
    // }

    // console.log('[Cron Elo] Sprawdzanie wyścigów oczekujących na przeliczenie rankingu...');

    // try {
    //     // 2. Pobieramy max 5 najstarszych nieprzetworzonych wyścigów (zabezpieczenie limitu czasu)
    //     const pendingEvents = await prisma.event.findMany({
    //         where: { processed: false },
    //         orderBy: { date: 'asc' },
    //         take: 5 
    //     });

    //     if (pendingEvents.length === 0) {
    //         return NextResponse.json({ 
    //             success: true, 
    //             message: 'Brak nowych wyścigów do przeliczenia. Wszystko jest aktualne.' 
    //         });
    //     }

    //     let processedCount = 0;
    //     let skippedCount = 0;

    //     // 3. Przetwarzamy wyścigi sekwencyjnie
    //     for (const event of pendingEvents) {
    //         try {
    //             console.log(`[Cron Elo] Przetwarzanie eventu: ${event.id} (${event.track})`);
    //             const result = await processEventElo(event);
                
    //             if (result.skipped) {
    //                 console.log(`[Cron Elo] Wyścig pominięty: ${result.reason}`);
    //                 skippedCount++;
    //             } else {
    //                 processedCount++;
    //             }

    //         } catch (error: any) {
    //             // Obsługa błędu Rate Limit z API ACSM (zwracanego przez nasz serwis)
    //             if (error.message === 'RATE_LIMIT') {
    //                 console.warn(`[Cron Elo] Wykryto 429 dla eventu ${event.id}. Przerywam pętlę dla tego cyklu crona.`);
    //                 break; 
    //             }
                
    //             console.error(`[Cron Elo] Błąd podczas naliczania ELO dla wyścigu ${event.id}:`, error.message);
    //             // Nie przerywamy całej pętli dla innych błędów (np. uszkodzony JSON pojedynczego wyścigu), 
    //             // żeby jeden zbugowany plik nie zablokował kolejnych, prawidłowych wyścigów.
    //         }
    //     }

    return NextResponse.json({
    success: true,
    });

        // return NextResponse.json({
        //     success: true,
        //     totalFound: pendingEvents.length,
        //     calculatedSuccessfully: processedCount,
        //     skipped: skippedCount
        // });

    // } catch (error: any) {
    //     console.error('[Cron Elo Critical Error]:', error);
    //     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    // }
}