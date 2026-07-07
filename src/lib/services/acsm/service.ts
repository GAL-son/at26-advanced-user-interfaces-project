"use server"

import { AcsmChampionshipList, AcsmEventList, AcsmEvent, AcsmRaceResult } from "./types";

const RATE_LIMIT_COOLDOWN = 25000;

// Pomocnicza funkcja realizująca opóźnienie
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Wrapper na fetch obsługujący ponowne próby dla błędu 429
async function fetchWithRetry(url: string, options?: RequestInit): Promise<Response> {
    while (true) {
        const response = await fetch(url, options);

        if (response.status === 429) {
            // Opcjonalnie: sprawdź czy serwer podał dokładny czas w nagłówku "Retry-After"
            const retryAfterHeader = response.headers.get("Retry-After");
            const waitTime = retryAfterHeader 
                ? parseInt(retryAfterHeader, 10) * 1000 
                : RATE_LIMIT_COOLDOWN;

            console.warn(`[429] Rate limit hit on ${url}. Waiting ${waitTime / 1000}s before retry...`);
            await delay(waitTime);
            continue; // Ponów pętlę i spróbuj ponownie
        }

        return response;
    }
}

export async function getAcsmChampionships(server: string): Promise<AcsmChampionshipList> {
    // Podmieniamy zwykły fetch na nasz fetchWithRetry
    const response = await fetchWithRetry(`${server}/api/championships/list.json`);

    if (!response.ok) {
        throw new Error(`Failed to fetch championships from ${server}. Reason: ${response.status}.`);
    }

    const data = await response.json();
    return data as AcsmChampionshipList;
}

export async function getAcsmEvents(server: string, page: number = 0): Promise<AcsmEventList> {
    const response = await fetchWithRetry(`${server}/api/results/list.json?page=${page}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch championships from ${server}. Reason: ${response.status}.`);
    }

    const data = await response.json();

    return {
        num_pages: data.num_pages,
        results: data.results.map((event: any): AcsmEvent => (
            {
                ...event,
                server: server
            } as AcsmEvent
        ))
    } as AcsmEventList;
}

export async function getAcsmResult(event: AcsmEvent, serverOverride?: string | undefined): Promise<AcsmRaceResult> {
    const server = serverOverride || event.server;
    const response = await fetchWithRetry(`${server}${event.results_json_url}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch championships from ${server}. Reason: ${response.status}.`);
    }

    const data = await response.json();
    return data as AcsmRaceResult;
}