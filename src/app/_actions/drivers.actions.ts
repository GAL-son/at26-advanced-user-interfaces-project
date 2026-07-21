"use server"

import { 
    getPaginatedDriversList, 
    DriverSortOption, 
    PaginatedDriversResult 
} from '@/lib/services/drivers.service';

/**
 * Akcja wywoływana z komponentu klienta do Lazy Loadingu
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