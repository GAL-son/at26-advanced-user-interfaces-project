import { prisma } from '../lib/db/db.js';
// import { processEventElo } from '../lib/services/eventEloService.js';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runEloSeeder() {
    // // 1. Sprawdzamy obecność flagi --replace lub -r w argumentach wywołania CLI
    // const args = process.argv.slice(2);
    // const isReplaceMode = args.includes('--replace') || args.includes('-r');

    // if (isReplaceMode) {
    //     console.log('🔄 [CLI] Wykryto flagę --replace. Rozpoczynam pełny reset danych rankingowych...');

    //     try {
    //         await prisma.$transaction([
    //             // A. Czyścimy całą historię zmian ELO
    //             prisma.eloHistory.deleteMany({}),

    //             // B. Przywracamy startowe 1000.0 wszystkim zarejestrowanym kierowcom
    //             prisma.driver.updateMany({
    //                 data: {
    //                     currentElo: 1000.0,
    //                     combo: 0
    //                 }
    //             }),

    //             // C. Odblokowujemy WSZYSTKIE wyścigi, aby pętla przetworzyła je chronologicznie na nowo
    //             prisma.event.updateMany({
    //                 data: { processed: false }
    //             })
    //         ]);

    //         console.log('✅ [CLI] Baza danych została pomyślnie zresetowana do stanu początkowego.');
    //     } catch (resetError: any) {
    //         console.error('❌ [CLI] Błąd podczas resetowania bazy danych:', resetError.message);
    //         process.exit(1);
    //     }
    // }

    // console.log('🚀 [CLI] Start przetwarzania ELO dla zaległych wyścigów...');

    // // Pobieramy wyścigi (jeśli był reset, zgarnie absolutnie wszystkie od najstarszego)
    // const pendingEvents = await prisma.event.findMany({
    //     where: { processed: false },
    //     orderBy: { date: 'asc' }
    // });

    // console.log(`📦 Znaleziono ${pendingEvents.length} wyścigów do przeliczenia.`);

    // let successCount = 0;
    // const ACSM_DELAY_MS = 4500;

    // for (const event of pendingEvents) {
    //     console.log(`\n--------------------------------------------------`);
    //     console.log(`🧮 Obliczanie ELO dla wyścigu: ${event.id} (${event.track})`);
    //     console.log(`🔗 Wyniki: ${event.resultsJsonUrl}`);
    //     console.log(`--------------------------------------------------`);

    //     try {
    //         const result = await processEventElo(event);

    //         if (result.skipped) {
    //             console.log(`⚠️  Wyścig pominięty: ${result.reason}`);
    //         } else {
    //             console.log(`✅ Sukces! Przeliczono punkty ELO dla ${result.driversCalculated} kierowców.`);
    //             successCount++;
    //         }

    //         await delay(ACSM_DELAY_MS);

    //     } catch (error: any) {
    //         if (error.message === 'RATE_LIMIT') {
    //             console.warn('⚠️  Złapano 429 (Rate Limit)! Odpoczynek 25 sekund...');
    //             await delay(25000);
    //         } else {
    //             console.error(`❌ Błąd krytyczny dla wyścigu ${event.id}:`, error.message);
    //             console.log('Zatrzymanie na 10s przed następnym krokiem...');
    //             await delay(10000);
    //         }
    //     }
    // }

    // console.log(`\n🏁 [CLI] Zakończono naliczanie ELO. Pomyślnie przetworzonych wyścigów: ${successCount}`);
}

runEloSeeder()
    .catch(e => {
        console.error('Błąd wykonania skryptu CLI:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });