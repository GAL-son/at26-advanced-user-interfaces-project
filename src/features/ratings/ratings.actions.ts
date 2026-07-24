"use server"

import type { DriverRatingHistoryResponseDto } from "./ratings.types";
import { getDriverRatingHistory } from "./services/ratings.service";

export async function getDriverRatingHistoryAction(
    guids: string[],
    page: number = 0,
    limit: number = 50
): Promise<DriverRatingHistoryResponseDto> {
    try {
        return await getDriverRatingHistory(guids, page, limit);
    } catch (error) {
        console.error("Błąd w akcji getDriverRatingHistoryAction:", error);
        throw new Error("Nie udało się pobrać historii ratingu kierowców.");
    }
}