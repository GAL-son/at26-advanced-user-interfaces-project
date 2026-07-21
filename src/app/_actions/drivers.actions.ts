"use server"

import {
    getPaginatedDriversList,
    getDriverDetails,
    DriverSortOption,
    PaginatedDriversResult,
    DriverDetailsDto
} from '@/lib/services/drivers.service';

import { 
    getDriverRatingHistory, 
    DriverRatingHistoryResponseDto 
} from '@/lib/services/drivers.service';

/**
 * Akcja wywoływana z komponentu klienta do Lazy Loadingu listy kierowców
 */
export async function getDriversListAction(
    skip: number = 0,
    take: number = 20,
    search?: string,
    sortBy: DriverSortOption = 'RATING_DESC'
): Promise<PaginatedDriversResult> {
    try {
        return await getPaginatedDriversList(skip, take, search, sortBy);
    } catch (error) {
        console.error("Błąd w akcji getDriversListAction:", error);
        throw new Error("Nie udało się pobrać kolejnej paczki kierowców.");
    }
}

/**
 * Akcja do pobierania szczegółowych danych i statystyk pojedynczego kierowcy
 */
export async function getDriverDetailsAction(guid: string): Promise<DriverDetailsDto | null> {
    try {
        return await getDriverDetails(guid);
    } catch (error) {
        console.error(`Błąd w akcji getDriverDetailsAction dla GUID ${guid}:`, error);
        throw new Error("Nie udało się pobrać szczegółowych danych kierowcy.");
    }
}

/**
 * Akcja serwerowa pobierająca historię punktów ratingowych kierowcy/kierowców
 */
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