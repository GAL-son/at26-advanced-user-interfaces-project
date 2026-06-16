import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/db';
import { processEventDrivers } from '@/lib/services/driverService';

export async function GET(request: Request) {
    // Bezpieczeństwo Crona
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    console.log('[Cron Drivers] Szukanie nieprzetworzonych wyścigów...');

    try {
        const pendingEvents = await prisma.event.findMany({
            where: { processed: false },
            orderBy: { date: 'asc' },
            take: 5 
        });

        if (pendingEvents.length === 0) {
            return NextResponse.json({ success: true, message: 'Wszystkie wyścigi są zsynchronizowane.' });
        }

        let processedCount = 0;

        for (const event of pendingEvents) {
            try {
                const result = await processEventDrivers(event);
                if (result.success) processedCount++;
                
            } catch (error: any) {
                if (error.message === 'RATE_LIMIT') {
                    console.warn(`[Cron Drivers] Wykryto 429 dla ${event.id}. Przerywam pętlę na ten cykl.`);
                    break; // Kończymy bezpiecznie, resztę wyścigów zgarnie kolejny przebieg Crona
                }
                console.error(`[Cron Drivers] Błąd w wyścigu ${event.id}:`, error.message);
                // Kontynuujemy pętlę dla następnych wyścigów w przypadku innych błędów
            }
        }

        return NextResponse.json({
            success: true,
            eventsFound: pendingEvents.length,
            eventsProcessedSuccessfully: processedCount
        });

    } catch (error: any) {
        console.error('[Cron Drivers Critical Error]:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}