import { prisma } from '@/lib/db/db.js'; // Added .js suffix often required by pure ESM loaders
import { type RaceResult } from '@/lib/db/types.js';
import { type ACSMEventList, type ACSMRaceResult } from '@/lib/acsm/types';
import { processEventElo } from '@/lib/services/Elo/EloService.js';
import crypto from 'crypto';

// --- Constants & Configuration ---
const ACMS_RATE_LIMIT_DELAY = 4500; // Time between successful list/detail calls (ms)
const RATE_LIMIT_COOLDOWN = 25000;   // Cooldown after hitting a 429 status (ms)
const NETWORK_ERROR_COOLDOWN = 10000; // Cooldown after a network error/timeout (ms)

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates a unique ID based on track configuration and date ISO string
 */
function generateEventId(track: string, date: string): string {
  const dateObject = new Date(date);
  if (isNaN(dateObject.getTime())) {
    throw new RangeError(`Invalid time value: ${date}`);
  }
  const dateString = dateObject.toISOString();
  const normalizedTrack = track.toLowerCase().trim();

  return crypto.createHash('md5').update(`${normalizedTrack}_${dateString}`).digest('hex');
}

/**
 * Robust fetch helper that handles 429 Rate Limits and intermittent connection dropouts.
 */
async function fetchWithRetry(url: string, userAgent = 'ACSM-Resilient-Ingestor'): Promise<Response | null> {
  while (true) {
    try {
      const response = await fetch(url, { 
        headers: { 'User-Agent': userAgent },
        cache: 'no-store' 
      });

      if (response.status === 429) {
        console.warn(`⚠️  Rate Limit (429) hit at ${url}! Cooling down for ${RATE_LIMIT_COOLDOWN / 1000}s...`);
        await delay(RATE_LIMIT_COOLDOWN);
        continue; // Retry the same URL
      }

      if (!response.ok) {
        console.error(`❌ Server responded with code ${response.status} for URL: ${url}`);
        return null;
      }

      return response;
    } catch (error: any) {
      console.error(`❌ Network error/timeout fetching ${url}:`, error.message);
      console.log(`Waiting ${NETWORK_ERROR_COOLDOWN / 1000}s before structural retrying...`);
      await delay(NETWORK_ERROR_COOLDOWN);
    }
  }
}

/**
 * Processes a specific race dataset, handles relational side effects (driver maps), 
 * and maps metrics within an isolated database transaction.
 */
async function ingestRawEventData(eventId: string, serverName: string, data: ACSMRaceResult): Promise<string | null> {
  try {
    return await prisma.$transaction(async (tx) => {
      const savedEvent = await tx.event.create({
        data: {
          id: eventId,
          name: data.EventName,
          track: data.TrackConfig ? `${data.TrackName} (${data.TrackConfig})` : data.TrackName,
          date: new Date(data.Date),
          server: serverName,
          processed: false
        }
      });

      const placeholderResults: Partial<RaceResult>[] = [];

      for (let index = 0; index < data.Result.length; index++) {
        const row = data.Result[index];
        const guid = row.DriverGuid.trim();

        const carInfo = data.Cars.find(c => c.Driver.Guid.trim() === guid);
        const driverName = row.DriverName || carInfo?.Driver.Name || 'Unknown Driver';

        const existingDriver = await tx.driver.findUnique({ where: { guid } });
        if (!existingDriver) {
          await tx.driver.create({
            data: { guid, mainName: driverName, currentElo: 1000.0, combo: 0 }
          });
        } else if (existingDriver.mainName !== driverName) {
          const altNamesArr = existingDriver.altNames ? existingDriver.altNames.split(', ') : [];
          if (!altNamesArr.includes(driverName)) {
            altNamesArr.push(driverName);
          }
          await tx.driver.update({
            where: { guid },
            data: { mainName: driverName, altNames: altNamesArr.join(', ') }
          });
        }

        placeholderResults.push({
          id: crypto.randomUUID(),
          eventId: savedEvent.id,
          driverGuid: guid,
          started: row.GridPosition || index + 1,
          position: index + 1,
          car: carInfo?.Model || 'Unknown',
          laps: row.NumLaps || 0,
          totalTime: row.TotalTime || 0,
          bestLap: row.BestLap || 0,
          gap: null,
          eloBefore: null,
          eloAfter: null,
          combo: null,
          eloAlg: null,
          createdAt: new Date(data.Date)
        });
      }

      await tx.raceResult.createMany({
        data: placeholderResults as any[]
      });

      return savedEvent.id;
    });
  } catch (error) {
    console.error(`❌ Error parsing structural write routines for race ${eventId}:`, error);
    return null;
  }
}

/**
 * Iterates through all unprocessed items chronologically to evaluate global Elo ratings
 */
async function processPendingEloChronologically() {
  console.log(`\n🧮 recalculating missing global Elo ranks...`);
  const pendingEvents = await prisma.event.findMany({
    where: { processed: false },
    orderBy: { date: 'asc' }
  });

  for (const event of pendingEvents) {
    try {
      const rawResults = await prisma.raceResult.findMany({
        where: { eventId: event.id },
        orderBy: { position: 'asc' }
      });

      const hydratedResults: RaceResult[] = [];

      for (const res of rawResults) {
        const currentDriverState = await prisma.driver.findUnique({
          where: { guid: res.driverGuid },
          select: { currentElo: true, combo: true }
        });

        hydratedResults.push({
          ...res,
          eloBefore: currentDriverState ? currentDriverState.currentElo : 1000.0,
          combo: currentDriverState ? currentDriverState.combo : 0
        } as RaceResult);
      }

      await processEventElo(event.id, hydratedResults);
    } catch (error) {
      console.error(`❌ Sequential calculation halted. Elo crash at race ${event.id}:`, error);
      break; // Safe exit to prevent sequence corruption
    }
  }
}

/**
 * Main Orchestration Loop
 */
async function runResilientIngestion() {
  const serversEnv = process.env.ACSM_SERVERS_LIST || process.env.ACSM_SERVERS;
  const servers = serversEnv ? serversEnv.split(',').map(url => url.trim()).filter(Boolean) : [];

  if (servers.length === 0) {
    console.error('❌ Configuration error: No base URLs resolved inside environment strings.');
    process.exit(1);
  }

  console.log(`🚀 Starting Resilient Event Ingestion Service across ${servers.length} target profiles...`);
  const newlyCreatedEventIds: string[] = [];

  for (const baseUrl of servers) {
    console.log(`\n--------------------------------------------------`);
    console.log(`🖥️  Target Node: ${baseUrl}`);
    console.log(`--------------------------------------------------`);

    let currentPage = 1; // ACSM pagination typically defaults starting from page index 1
    let totalPages = 1;

    do {
      const listUrl = `${baseUrl}/api/results/list.json?page=${currentPage}`;
      console.log(`[Page ${currentPage}/${totalPages || '?'}] Fetching collection data...`);

      const response = await fetchWithRetry(listUrl);
      if (!response) {
        console.error(`❌ Skipping remaining pages for server due to fatal communication errors.`);
        break;
      }

      const pageData = (await response.json()) as ACSMEventList;
      totalPages = pageData.num_pages;

      if (!pageData || !pageData.results || !Array.isArray(pageData.results)) {
        console.log(`ℹ️ Empty array data layer context. Progressing to the next active cluster.`);
        break;
      }

      for (const eventInfo of pageData.results) {
        if (eventInfo.session_type.toLowerCase() !== 'race') {
          continue;
        }

        let eventId = eventInfo.id;
        if (!eventId) {
          try {
            eventId = generateEventId(eventInfo.track, eventInfo.date);
          } catch (e) {
            console.error(`❌ Failed tracking identifier creation on ${eventInfo.track}:`, e);
            continue;
          }
        }

        // Avoid structural duplication
        const exists = await prisma.event.findUnique({ where: { id: eventId } });
        if (exists) continue;

        console.log(`   ↳ Ingesting structural data for raw details of race: ${eventId}`);
        
        // Pace individual detail requests to respect target rate limits
        await delay(ACMS_RATE_LIMIT_DELAY);
        
        const detailUrl = `${baseUrl}${eventInfo.results_json_url}`;
        const detailsResponse = await fetchWithRetry(detailUrl);
        if (!detailsResponse) continue;

        const eventDetails = (await detailsResponse.json()) as ACSMRaceResult;
        const savedId = await ingestRawEventData(eventId, baseUrl, eventDetails);
        
        if (savedId) {
          newlyCreatedEventIds.push(savedId);
        }
      }

      currentPage++;
      await delay(ACMS_RATE_LIMIT_DELAY); // Page-turn rate limiter backup spacing

    } while (currentPage <= totalPages);
  }

  // Calculate scores chronologically across updates if records passed initialization successfully
  if (newlyCreatedEventIds.length > 0) {
    await processPendingEloChronologically();
  }

  console.log(`\n🏁 Operations successfully wrapped up! Ingested records processing complete.`);
}

// Global script run initiation hook.
runResilientIngestion()
  .catch(e => {
    console.error("🚨 Script encountered a fatal exception during pipeline setup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });