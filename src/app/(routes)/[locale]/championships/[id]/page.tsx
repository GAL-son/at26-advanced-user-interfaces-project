import { notFound } from "next/navigation";
import { getChampionship } from "@/features/championships/services/championships.service"
import ChampionshipDetailsView from "@/features/championships/views/ChampionshipDetailsView"

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
    <ChampionshipDetailsView 
      championship={championship} 
      searchParams={resolvedSearchParams} 
    />
  );
}