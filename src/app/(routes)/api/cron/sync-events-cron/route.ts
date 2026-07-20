import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/db';
import { getAcsmChampionships, getAcsmEvents, getAcsmResult as getAcsmResults } from "@/lib/services/acsm/service";
import { AcsmChampionshipInfo, AcsmEvent, AcsmSessionType } from "@/lib/services/acsm/types";
import { syncChampionshipFromAcsm } from "@/lib/services/championships.service";
import { syncDriverFromAcsm } from "@/lib/services/drivers.service";
import { syncEventFromAcsm } from "@/lib/services/events.service";
import { syncSessionFromAcsm } from "@/lib/services/session/service";
import { startingRating } from "@/lib/services/rating/config";
import { syncResultFromAcsm } from "@/lib/services/result/service";

const ACMS_RATE_LIMIT_DELAY = 4500;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function shuffleArray<T>(array: T[]): T[] {
    return array.map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const serversEnv = process.env.ACSM_SERVERS_LIST || process.env.ACSM_SERVERS;
    let servers = serversEnv ? serversEnv.split(',').map(url => url.trim()).filter(Boolean) : [];

    if (!servers.length) {
        return NextResponse.json({ error: "No servers provided" }, { status: 400 });
    }

    servers = shuffleArray(servers);

    try {
        const latestSessions = await prisma.session.groupBy({
            by: ['eventId'],
            _max: { date: true }
        });

        const eventsWithServers = await prisma.event.findMany({
            where: { id: { in: latestSessions.map(s => s.eventId) } },
            select: { id: true, server: true }
        });

        const serverLatestDatesMap: Record<string, Date> = {};
        latestSessions.forEach(s => {
            const ev = eventsWithServers.find(e => e.id === s.eventId);
            if (ev?.server) {
                const currentDate = serverLatestDatesMap[ev.server];
                if (!currentDate || (s._max.date && s._max.date > currentDate)) {
                    if (s._max.date) serverLatestDatesMap[ev.server] = s._max.date;
                }
            }
        });

        const championshipsArray = await getAllChampionships(servers);
        const championships: Record<string, AcsmChampionshipInfo> = Object.fromEntries(
            championshipsArray.map((info: AcsmChampionshipInfo) => [info.id, info])
        );

        const allowedSessions = [AcsmSessionType.RACE, AcsmSessionType.QUALIFY];
        const newEventsToProcess: AcsmEvent[] = [];

        for (const server of servers) {
            console.log(`[Cron] Checking server: ${server}`);
            const latestKnownDate = serverLatestDatesMap[server];

            let pageNum = 0;
            let keepSearchingServer = true;

            while (keepSearchingServer) {
                console.log(`[Cron] Fetching page ${pageNum} from ${server}`);
                const page = await getAcsmEvents(server, pageNum);
                
                if (!page.results || page.results.length === 0) {
                    break;
                }

                for (const event of page.results) {
                    const eventDate = new Date(event.date);

                    if (latestKnownDate && eventDate.getTime() <= latestKnownDate.getTime()) {
                        console.log(`[Cron] Reached already synchronized events on ${server}. Stopping hierarchy scan.`);
                        keepSearchingServer = false;
                        break;
                    }

                    if (allowedSessions.includes(event.session_type)) {
                        newEventsToProcess.push({ ...event, server });
                    }
                }

                if (pageNum >= page.num_pages - 1) {
                    keepSearchingServer = false;
                }

                pageNum++;
                if (keepSearchingServer) await delay(ACMS_RATE_LIMIT_DELAY);
            }
        }

        console.log(`[Cron] Found ${newEventsToProcess.length} new sessions to synchronize:`);
        console.info(newEventsToProcess.map(e => e.results_json_url));

        if (newEventsToProcess.length === 0) {
            return NextResponse.json({ message: "Everything up to date. 0 new events." });
        }

        newEventsToProcess.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let processedCount = 0;
        for (const event of newEventsToProcess) {
            const results = await getAcsmResults(event);

            if (!results.ChampionshipID || !championships[results.ChampionshipID]) {
                continue;
            }

            await syncChampionshipFromAcsm(championships[results.ChampionshipID]);

            const eventId = results.ChampionshipID + "_" + (results.EventName ?? results.TrackName).replaceAll(" ", "_");
            await syncEventFromAcsm(eventId, event.server ?? "", results);

            const session = await syncSessionFromAcsm(eventId, results);
            const isSessionQualify = event.session_type == AcsmSessionType.QUALIFY;
            const timeToGap = isSessionQualify ? results.Result[0].BestLap : results.Result[0].TotalTime;

            const eventDate = new Date(results.Date);

            for (const [index, result] of results.Result.entries()) {
                if (!result.DriverGuid) continue;

                await syncDriverFromAcsm(result.DriverGuid, result.DriverName, startingRating, eventDate);

                const gap = (isSessionQualify ? result.BestLap : result.TotalTime) - timeToGap;
                await syncResultFromAcsm(session.id, result, isSessionQualify, index + 1, gap);
            }

            processedCount++;
            await delay(ACMS_RATE_LIMIT_DELAY);
        }

        return NextResponse.json({ success: true, syncedSessions: processedCount });

    } catch (error) {
        console.error("[Cron Error]", error);
        return NextResponse.json({ error: "Internal Server Error during cron sync" }, { status: 500 });
    }
}

async function getAllChampionships(servers: string[]): Promise<AcsmChampionshipInfo[]> {
    const championshipsWithDuplicates = [];
    for (const server of servers) {
        try {
            const list = await getAcsmChampionships(server);
            championshipsWithDuplicates.push(...list.championships);
        } catch (e) {
            console.error(`Failed to fetch championships from ${server}`, e);
        }
    }
    return [...new Set(championshipsWithDuplicates)];
}