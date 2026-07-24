"use server"

import {
  getDriversBasicInfoByGuids, 
  searchDrivers,
  getPaginatedDriversList,
  getDriverDetails,
} from './services/drivers.service';

import type {
  DriverBasicDto,
  DriverDetailsDto,
  DriverSortOption,
  PaginatedDriversResult,
} from './drivers.types';

export async function searchDriversAction(query: string): Promise<DriverBasicDto[]> {
    try {
        return await searchDrivers(query);
    } catch (error) {
        console.error("Błąd w akcji searchDriversAction:", error);
        return [];
    }
}

export async function getDriversBasicInfoAction(guids: string[]): Promise<DriverBasicDto[]> {
    try {
        return await getDriversBasicInfoByGuids(guids);
    } catch (error) {
        console.error("Błąd w akcji getDriversBasicInfoAction:", error);
        return [];
    }
}

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

export async function getDriverDetailsAction(guid: string): Promise<DriverDetailsDto | null> {
    try {
        return await getDriverDetails(guid);
    } catch (error) {
        console.error(`Błąd w akcji getDriverDetailsAction dla GUID ${guid}:`, error);
        throw new Error("Nie udało się pobrać szczegółowych danych kierowcy.");
    }
}