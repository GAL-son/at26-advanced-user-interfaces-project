import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
    const serversEnv = process.env.ACSM_SERVERS_LIST || "";
    const servers = serversEnv.split(',').map(s => s.trim()).filter(Boolean);

    const allEvents = [];

    try {
        for (const baseUrl of servers) {
            const response = await fetch(`${baseUrl}/api/results/list.json?page=0`); // Na potrzeby testów pobieramy tylko 1. stronę
            if (!response.ok) continue;

            const data = await response.json();

            const raceEvents = data.results
                .filter((e: any) => e.session_type === "RACE")
                .map((e: any) => ({
                    server: baseUrl,
                    track: e.track,
                    date: e.date,
                    jsonUrl: `${baseUrl}${e.results_json_url}`,
                    id: btoa(`${baseUrl}-${e.results_json_url}`) // Proste ID do kluczy React
                }));

            allEvents.push(...raceEvents);
        }

        // Sortowanie od najnowszych
        allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json(allEvents);
    } catch (error) {
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}