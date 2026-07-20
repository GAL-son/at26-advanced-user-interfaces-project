import React from "react";
import ChampionshipsPage from "@/app/_pages/ChampionshipsPage";

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedParams = await searchParams; // Next.js rozwiązuje Promise tutaj

  return (
    <ChampionshipsPage searchParams={resolvedParams} /> // Przekazuje czysty obiekt
  );
}