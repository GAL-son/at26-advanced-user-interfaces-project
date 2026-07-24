"use server"

import type { EventDetailsDto } from "./events.types";
import { getEventDetails } from "./services/events.service";

export async function getEventDetailsAction(eventId: string): Promise<EventDetailsDto | null> {
    try {
        return await getEventDetails(eventId);
    } catch (error) {
        console.error(`Błąd podczas pobierania detali eventu ${eventId}:`, error);
        throw new Error("Nie udało się pobrać szczegółów eventu.");
    }
}