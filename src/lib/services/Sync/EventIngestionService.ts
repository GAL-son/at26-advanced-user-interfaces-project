import { prisma } from '@/lib/db/db';
import { type RaceResult } from '@/lib/db/types';
import { type ACSMEventList, type ACSMRaceResult } from './types/acsm';
import { processEventElo } from '@/lib/services/Elo/EloService';
import crypto from 'crypto'; // Wymagane do działania metody generateEventId

interface ServerConfig {
  name: string;
  url: string;
}

export class EventIngestionService {
  private servers: ServerConfig[];

  constructor() {
    try {
      const serversEnv = process.env.ACSM_SERVERS;
      this.servers = serversEnv
        ? serversEnv.split(',').map(url => ({ name: url.trim(), url: url.trim() }))
        : [];
    } catch (error) {
      console.error('Krytyczny błąd podczas parsowania ACSM_SERVERS z pliku .env:', error);
      this.servers = [];
    }
  }

  /**
   * Generuje unikalne ID na podstawie toru oraz daty
   */
  private generateEventId(track: string, date: string): string {
    const dateObject = new Date(date);
    if (isNaN(dateObject.getTime())) {
      throw new RangeError(`Invalid time value: ${date}`);
    }
    const dateString = dateObject.toISOString();
    const normalizedTrack = track.toLowerCase().trim();

    return crypto.createHash('md5').update(`${normalizedTrack}_${dateString}`).digest('hex');
  }

  /**
   * KROK 1 & 2: Pętla po wszystkich serwerach z ENV, ich stronach i zapis surowych danych
   */
  async fetchAndIngestAllEvents() {
    if (this.servers.length === 0) {
      console.warn('Lista serwerów w ENV jest pusta. Przerywam proces ingestion.');
      return;
    }

    const newlyCreatedEventIds: string[] = [];

    for (const server of this.servers) {
      console.log(`Rozpoczynam pobieranie z serwera: ${server.name} (${server.url})`);
      
      let currentPage = 1;
      let totalPages = 1;

      try {
        do {
          console.log(`${server.url}/api/results/list.json?page=${currentPage}`);
          const response = await fetch(`${server.url}/api/results/list.json?page=${currentPage}`, { cache: 'no-store' });
          if (!response.ok) break;

          const pageData = (await response.json()) as ACSMEventList;
          totalPages = pageData.num_pages;

          for (const eventInfo of pageData.results) {
            if (eventInfo.session_type.toLowerCase() !== 'race') {
              continue;
            }

            let eventId = eventInfo.id;
            if (!eventId) {
              try {
                eventId = this.generateEventId(eventInfo.track, eventInfo.date);
              } catch (e) {
                console.error(`Nie można wygenerować ID dla eventu na torze ${eventInfo.track}:`, e);
                continue; // Pomija uszkodzony wpis bez wywalania całej pętli
              }
            }

            // Zapobieganie duplikatom w bazie danych na podstawie docelowego ID
            const exists = await prisma.event.findUnique({ where: { id: eventId } });
            if (exists) continue;

            const eventDetails = await this.fetchEventJson(`${server.url}${eventInfo.results_json_url}`);
            if (!eventDetails) continue;

            const savedId = await this.ingestRawEventData(eventId, server.name, eventDetails);
            if (savedId) {
              newlyCreatedEventIds.push(savedId);
            }
          }

          currentPage++;
        } while (currentPage <= totalPages);

      } catch (error) {
        console.error(`Błąd podczas parsowania stron z serwera ${server.name}:`, error);
      }
    }

    if (newlyCreatedEventIds.length > 0) {
      await this.processPendingEloChronologically();
    }
  }

  /**
   * Zapis podstawowych danych i przygotowanie placeholderów wyników
   */
  private async ingestRawEventData(eventId: string, serverName: string, data: ACSMRaceResult): Promise<string | null> {
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
            id: crypto.randomUUID(), // Tutaj używamy wbudowanego crypto do generowania UUID w Node.js
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
      console.error(`Błąd podczas przetwarzania surowego wyścigu ${eventId}:`, error);
      return null;
    }
  }

  private async processPendingEloChronologically() {
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
        console.error(`Chronologia przerwana. Błąd ELO w wyścigu ${event.id}:`, error);
        break; 
      }
    }
  }

  private async fetchEventJson(url: string): Promise<ACSMRaceResult | null> {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) return null;
      return (await response.json()) as ACSMRaceResult;
    } catch {
      return null;
    }
  }
}