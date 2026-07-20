import React from "react";
import { notFound } from "next/navigation";
import { getChampionship } from "@/lib/services/championships.service";
import ChampionshipDetailsPage from "@/app/_pages/ChampionshipDetailsPage";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ search?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const championship = await getChampionship(id);

  if (!championship) {
    notFound();
  }

  return (
    <ChampionshipDetailsPage 
      championship={championship} 
      searchParams={resolvedSearchParams} 
    />
  );
}