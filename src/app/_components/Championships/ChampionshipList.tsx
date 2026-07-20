"use client";

import React from "react";
import InfiniteScrollList from "@/app/_components/Common/InfiniteScrollList";
import ChampionshipCard from "./ChampionshipCard";
import { fetchChampionshipsAction } from "@/app/_actions/championship.actions";
import type { ChampionshipListItemDto } from "@/lib/services/championships.service";

interface InfiniteChampionshipListProps {
  initialItems: ChampionshipListItemDto[];
  initialHasMore: boolean;
  searchQuery: string;
  limit: number;
}

export default function ChampionshipList({
  initialItems,
  initialHasMore,
  searchQuery,
  limit,
}: InfiniteChampionshipListProps) {
  return (
    <InfiniteScrollList<ChampionshipListItemDto>
      initialItems={initialItems}
      initialHasMore={initialHasMore}
      searchQuery={searchQuery}
      limit={limit}
      
      fetchDataAction={fetchChampionshipsAction}
      renderItem={(championship) => <ChampionshipCard championship={championship} />}
      getKey={(championship) => championship.id}
    />
  );
}