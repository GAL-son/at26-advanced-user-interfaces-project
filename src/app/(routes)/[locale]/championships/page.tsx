import ChampionshipsListView from "@/features/championships/views/ChampionshipsListView";

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedParams = await searchParams; // Next.js rozwiązuje Promise tutaj

  return (
    <ChampionshipsListView searchParams={resolvedParams} /> // Przekazuje czysty obiekt
  );
}