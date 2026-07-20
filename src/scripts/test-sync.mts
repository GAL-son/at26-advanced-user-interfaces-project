"use server"

import { getAcsmChampionships, getAcsmEvents, getAcsmResult as getAcsmResults } from "@/lib/services/acsm/service";
import { AcsmChampionshipList, AcsmChampionshipInfo, AcsmEvent, AcsmSessionType } from "@/lib/services/acsm/types";

import { syncChampionshipFromAcsm } from "@/lib/services/championships.service";
import { syncDriverFromAcsm } from "@/lib/services/drivers.service";
import { syncEventFromAcsm } from "@/lib/services/events.service";
import { syncSessionFromAcsm } from "@/lib/services/session/service";

import { startingRating } from "@/lib/services/rating/config";
import { syncResultFromAcsm } from "@/lib/services/result/service";

const ACMS_RATE_LIMIT_DELAY = 4500; // Time between successful list/detail calls (ms)

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function getAllChampionships(servers: string[]): Promise<AcsmChampionshipInfo[]> {
    const championshipsWithDuplicates = [];

    for (const server of servers) {
        const list = await getAcsmChampionships(server);
        championshipsWithDuplicates.push(...list.championships)
    }

    const championships = [... new Set(championshipsWithDuplicates)]

    return championships;
}

async function getAllEvents(servers: string[]): Promise<AcsmEvent[]> {
    const allEvents = []
    for (const server of servers) {
        // First fetch the number of pages
        const firstPage = await getAcsmEvents(server);
        let pages = firstPage.num_pages - 1;

        console.log(pages)

        // Iterate over pages from last to first
        while (pages > 0) {
            console.info(`Fetching page ${pages} from server ${server}`);
            const page = await getAcsmEvents(server, pages)
            allEvents.push(
                ...page.results
            );
            await delay(ACMS_RATE_LIMIT_DELAY)

            pages--;
        }

        allEvents.push(...firstPage.results);
    }

    return allEvents;
}


const serversEnv = process.env.ACSM_SERVERS_LIST || process.env.ACSM_SERVERS;
const servers = serversEnv ? serversEnv.split(',').map(url => url.trim()).filter(Boolean) : [];

if (!servers.length) {
    console.warn("No servers povided");
    process.exit(1)
}

//  Get the list of championships
const championshipsArray = await getAllChampionships(servers);
const championships = Object.fromEntries(
    championshipsArray.map((info: AcsmChampionshipInfo) => [info.id, info])
);


// Get the list of all important events from each server
const allowedSessions = [AcsmSessionType.RACE, AcsmSessionType.QUALIFY];

const allEvents = await getAllEvents(servers);
const events = [... new Set(allEvents.filter((event) => allowedSessions.includes(event.session_type)))]
console.log(events.length)

// Sort events by date from oldest to newest
events.sort((a: AcsmEvent, b: AcsmEvent) => {
    const aDate = new Date(a.date);
    const bDate = new Date(b.date);

    return aDate.getTime() - bDate.getTime();
})

for (const event of events) {
    console.log(event.date + " " + event.track)
    const results = await getAcsmResults(event);

    console.log({
        championship: championships[results.ChampionshipID]?.name,
        championshipId: results.ChampionshipID,
        eventName: results.EventName,
        sessionType: results.Type,
        date: results.Date
    });

    // If championship is unknown, skip this event
    if (!results.ChampionshipID || !championships[results.ChampionshipID]) {
        continue;
    }
    
    await syncChampionshipFromAcsm(championships[results.ChampionshipID]);
    // Save event under new id
    const eventId = results.ChampionshipID + "_" + (results.EventName ?? results.TrackName).replaceAll(" ", "_");
    await syncEventFromAcsm(eventId, event.server ?? "", results);

    // Save session
    const session = await syncSessionFromAcsm(eventId, results);
    const isSessionQualify = event.session_type == AcsmSessionType.QUALIFY
    const timeToGap = isSessionQualify ? results.Result[0].BestLap :  results.Result[0].TotalTime;


    // Save drivers and their results
    for(const [index, result] of results.Result.entries()) {
        if(!result.DriverGuid) continue;
        
        await syncDriverFromAcsm(result.DriverGuid, result.DriverName, startingRating, new Date(results.Date));
       
        const gap = (isSessionQualify ? result.BestLap : result.TotalTime) - timeToGap;
        await syncResultFromAcsm(session.id, result, isSessionQualify, index+1, gap);
    }

    await delay(ACMS_RATE_LIMIT_DELAY)
}





