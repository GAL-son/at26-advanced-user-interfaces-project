"use server";

import { getChampionshipsList } from "@/lib/services/championships.service"
import type { ChampionshipListItemDto } from "@/lib/services/championships.service";

interface FetchChampionshipsResponse {
  success: boolean;
  data: ChampionshipListItemDto[];
  hasMore: boolean;
  error?: string;
}

export async function fetchChampionshipsAction(
  skip: number,
  take: number,
  search?: string
): Promise<FetchChampionshipsResponse> {
  try {
    // Bezpośrednie wywołanie funkcji bazodanowej na serwerze
    const data = await getChampionshipsList(skip, take, search);

    console.log(data); // logujemy dane, żeby zobaczyć
    
    return {
      success: true,
      data,
      hasMore: data.length === take,
    };
  } catch (error: any) {
    console.error("Server Action Error [fetchChampionshipsAction]:", error);
    return {
      success: false,
      data: [],
      hasMore: false,
      error: error.message || "Failed to fetch championships",
    };
  }
}