import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/db';
import crypto from 'crypto';
import type { ACSMApiResponse, ACSMEvent } from './types';

function generateEventId(track: string, date: string | Date): string {
    const dateObject = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObject.getTime())) {
        throw new RangeError(`Invalid time value: ${date}`);
    }
    const dateString = dateObject.toISOString();
    const normalizedTrack = track.toLowerCase().trim();

    return crypto.createHash('md5').update(`${normalizedTrack}_${dateString}`).digest('hex');
}

export async function GET(request: Request) {
    // Zabezpieczenie przed nieautoryzowanym wywołaniem poza Vercel Cron
    // const authHeader = request.headers.get('authorization');
    // if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response('Unauthorized', { status: 401 });
    // }

    // const serversEnv = process.env.ACSM_SERVERS_LIST || "";
    // const servers = serversEnv.split(',').map(s => s.trim()).filter(Boolean);

    // let totalAdded = 0;

    // console.log(`[Cron Sync] Rozpoczynam rutynowe sprawdzanie ${servers.length} serwerów.`);

    // try {
    //     for (const baseUrl of servers) {
    //         // Sprawdzamy tylko stronę 0 – najświeższe 25 sesji, gdzie znajdą się maksymalnie 2 wyścigi z tygodnia
    //         const url = `${baseUrl}/api/results/list.json?page=0`;

    //         const response = await fetch(url, { cache: 'no-store' });

    //         if (response.status === 429) {
    //             console.warn(`[Cron Limit] Serwer ${baseUrl} zwrócił 429. Pomijam w tym cyklu.`);
    //             continue; 
    //         }

    //         if (!response.ok) {
    //             console.error(`[Cron Error] Serwer ${baseUrl} zwrócił status ${response.status}`);
    //             continue; 
    //         }

    //         const data = (await response.json()) as ACSMApiResponse;

    //         if (!data || !data.results || !Array.isArray(data.results)) {
    //             continue; 
    //         }

    //         // Wyciągamy wyłącznie wyścigi z najnowszej paczki danych
    //         const raceEvents = data.results.filter((e): e is ACSMEvent => e && e.session_type === "RACE");

    //         if (raceEvents.length === 0) {
    //             continue;
    //         }

    //         let pageExistingEventsCount = 0;

    //         for (const eventData of raceEvents) {
    //             try {
    //                 const eventId = generateEventId(eventData.track, eventData.date);

    //                 const existingEvent = await prisma.event.findUnique({
    //                     where: { id: eventId }
    //                 });

    //                 if (existingEvent) {
    //                     pageExistingEventsCount++;
    //                     continue; 
    //                 }

    //                 await prisma.event.create({
    //                     data: {
    //                         id: eventId,
    //                         server: baseUrl,
    //                         track: eventData.track,
    //                         date: new Date(eventData.date),
    //                         resultsJsonUrl: `${baseUrl}${eventData.results_json_url}`,
    //                         processed: false
    //                     }
    //                 });

    //                 totalAdded++;
    //             } catch (error: any) {
    //                 if (error.code === 'P2002') {
    //                     pageExistingEventsCount++;
    //                 }
    //                 continue;
    //             }
    //         }

    //         // Jeśli wszystkie wyścigi z najnowszej strony już znamy, logujemy informację i lecimy dalej
    //         if (pageExistingEventsCount === raceEvents.length) {
    //             console.log(`[Cron Sync] Brak nowych wydarzeń na serwerze ${baseUrl}. Wszystko aktualne.`);
    //         }
    //     }

    //     return NextResponse.json({ 
    //         success: true, 
    //         mode: "Incremental Cron (Page 0)",
    //         newEventsSynced: totalAdded 
    //     });

    // } catch (error: any) {
    //     console.error("Cron Sync Critical Error:", error);
    //     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    // }

    return NextResponse.json({
        success: true,
    });
}