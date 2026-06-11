import { prisma } from '../lib/db/db.js'; 
import { processEventDrivers } from '../lib/services/driverService.js';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runLocalSeeder() {
    console.log('🚀 [CLI] Start masowego przetwarzania kierowców za pomocą driverService...');
    
    // Pobieramy wyścigi - dopóki proces sterujący nie ustawi processed: true, 
    // ten skrypt przy każdym uruchomieniu przejdzie po nich ponownie
    const pendingEvents = await prisma.event.findMany({
        where: { processed: false },
        orderBy: { date: 'asc' }
    });

    console.log(`📦 Znaleziono ${pendingEvents.length} wyścigów do analizy kierowców.`);

    let totalProcessed = 0;

    for (const event of pendingEvents) {
        console.log(`\n--------------------------------------------------`);
        console.log(`🏁 Przetwarzanie wyścigu: ${event.id} (${event.track})`);
        console.log(`🔗 URL: ${event.resultsJsonUrl}`);
        console.log(`--------------------------------------------------`);

        try {
            const result = await processEventDrivers(event);
            
            if (result.skipped) {
                console.log(`⚠️  Pominięto wyścig: ${result.reason}`);
            } else {
                console.log(`✅ Zakończone sukcesem. Przetworzono kierowców: ${result.processedDriversCount}`);
                totalProcessed++;
            }

            // Bezpieczny odstęp dla API ACSM
            await delay(4500); 

        } catch (error: any) {
            if (error.message === 'RATE_LIMIT') {
                console.warn('⚠️  Blokada 429! Długie chłodzenie sesji (25 sekund)...');
                await delay(25000);
            } else {
                console.error(`❌ Błąd przetwarzania tego wyścigu:`, error.message);
                console.log(`Odpoczynek 10s przed przejściem dalej...`);
                await delay(10000);
            }
        }
    }

    console.log(`\n🏁 [CLI] Synchronizacja kierowców zakończona. Przeanalizowano wyścigów: ${totalProcessed}`);
}

runLocalSeeder()
    .catch(e => {
        console.error('Krytyczny błąd wykonania skryptu CLI:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });