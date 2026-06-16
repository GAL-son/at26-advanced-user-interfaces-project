import { prisma } from '@/lib/db/db';
import crypto from 'crypto';

// Definicja typów dla API ACSM
interface ACSMEvent {
  id: string;
  track: string;
  date: string;
  session_type: string;
  results_json_url: string;
}

interface ACSMApiResponse {
  results: ACSMEvent[];
  num_pages: number;
}

function generateEventId(track: string, date: string): string {
    const dateObject = new Date(date);
    if (isNaN(dateObject.getTime())) {
        throw new RangeError(`Invalid time value: ${date}`);
    }
    const dateString = dateObject.toISOString();
    const normalizedTrack = track.toLowerCase().trim();

    return crypto.createHash('md5').update(`${normalizedTrack}_${dateString}`).digest('hex');
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runFullSeed() {
    const serversEnv = process.env.ACSM_SERVERS_LIST || "";
    const servers = serversEnv.split(',').map(s => s.trim()).filter(Boolean);

    if (servers.length === 0) {
        console.error("❌ Brak serwerów w zmiennej ACSM_SERVERS_LIST");
        process.exit(1);
    }

    console.log(`🚀 Rozpoczynam lokalny FULL SEED dla ${servers.length} serwerów przy użyciu @/lib/db...`);
    let totalAdded = 0;
    const ACMS_RATE_LIMIT_DELAY = 4500; 

    for (const baseUrl of servers) {
        let currentPage = 0;
        let hasMorePages = true;

        console.log(`\n--------------------------------------------------`);
        console.log(`🖥️  Serwer: ${baseUrl}`);
        console.log(`--------------------------------------------------`);

        while (hasMorePages) {
            const url = `${baseUrl}/api/results/list.json?page=${currentPage}`;
            console.log(`[Strona ${currentPage}] Pobieranie...`);

            try {
                const response = await fetch(url, { headers: { 'User-Agent': 'ACSM-Local-Seeder' } });

                if (response.status === 429) {
                    console.warn(`⚠️  Rate Limit (429)! Chłodzenie blokady przez 25 sekund...`);
                    await delay(25000);
                    continue; 
                }

                if (!response.ok) {
                    console.error(`❌ Serwer zwrócił błąd ${response.status}. Przerywam ten serwer.`);
                    break;
                }

                const data = (await response.json()) as ACSMApiResponse;

                if (!data || !data.results || !Array.isArray(data.results)) {
                    console.log(`ℹ️  Brak wyników lub koniec danych.`);
                    break;
                }

                const raceEvents = data.results.filter(e => e && e.session_type === "RACE");
                console.log(`   Znaleziono wyścigów na stronie: ${raceEvents.length}`);

                for (const eventData of raceEvents) {
                    try {
                        const eventId = generateEventId(eventData.track, eventData.date);

                        const existing = await prisma.event.findUnique({ where: { id: eventId } });
                        if (existing) continue;

                        await prisma.event.create({
                            data: {
                                id: eventId,
                                server: baseUrl,
                                track: eventData.track,
                                date: new Date(eventData.date),
                                resultsJsonUrl: `${baseUrl}${eventData.results_json_url}`,
                                processed: false
                            }
                        });

                        totalAdded++;
                    } catch (dbError: any) {
                        if (dbError.code !== 'P2002') {
                            console.error(`   Błąd zapisu wyścigu:`, dbError.message);
                        }
                    }
                }

                if (currentPage >= data.num_pages || data.results.length === 0) {
                    console.log(`✅ Osiągnięto koniec historii dla: ${baseUrl}`);
                    hasMorePages = false;
                } else {
                    currentPage++;
                    await delay(ACMS_RATE_LIMIT_DELAY);
                }

            } catch (fetchError: any) {
                console.error(`❌ Błąd sieciowy dla ${url}:`, fetchError.message);
                console.log(`Odpoczynek 10s przed ponowną próbą...`);
                await delay(10000);
            }
        }
    }

    console.log(`\n🏁 Gotowe! Łącznie zsynchronizowano za pomocą @/lib/db: ${totalAdded} wyścigów.`);
}

runFullSeed()
    .catch(e => {
        console.error("Krytyczny błąd skryptu:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });