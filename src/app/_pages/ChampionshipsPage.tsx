import React from "react";
import { getTranslations } from "next-intl/server";
import { fetchChampionshipsAction } from "@/app/_actions/championship.actions";
import ChampionshipList from "@/app/_components/Championships/ChampionshipList"; // Upewnij się, że ścieżka do Twojego komponentu się zgadza

interface Props {
  // Zmieniamy z: searchParams: Promise<{ search?: string }>;
  searchParams: { search?: string }; 
}

export default async function ChampionshipsPage({ searchParams }: Props) {
  const t = await getTranslations("Events");
  
  // Skoro searchParams jest już zwykłym obiektem, nie musisz tu robić `await searchParams`
  const searchQuery = searchParams.search || "";
  const LIMIT = 12;

  const initialResult = await fetchChampionshipsAction(0, LIMIT, searchQuery);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[var(--color-brand-navy)] text-[var(--color-brand-text)] transition-colors duration-300">
      <main className="max-w-7xl mx-auto p-0">
        
        <header 
          data-section="championships-header"
          className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <h1 className="text-page-title text-[var(--color-brand-text)]">
            {t("title") || "Mistrzostwa"}
          </h1>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:max-w-xl flex-1 justify-end">
            <div id="championships-search-container" className="w-full sm:flex-1 md:max-w-full">
              {/* Miejsce na wyszukiwarkę */}
            </div>

            <button 
              id="championships-refresh-btn"
              className="h-12 px-5 py-3 uppercase font-bold text-xs tracking-wider whitespace-nowrap transition-all duration-200 rounded-[var(--radius-brand-card)] border border-[var(--color-brand-navy-light)] text-[var(--color-brand-text-muted)] bg-[color-mix(in_srgb,var(--color-brand-navy-dark)_40%,transparent)] hover:border-[var(--color-brand-yellow-hover)] hover:text-[var(--color-brand-yellow-text)] hover:bg-[color-mix(in_srgb,var(--color-brand-yellow)_8%,transparent)] disabled:opacity-40 focus-brand"
            >
              {t("buttons.refresh") || "Odśwież"}
            </button>
          </div>
        </header>

        <div id="championships-feed-container" aria-live="polite">
          <ChampionshipList 
            initialItems={initialResult.data}
            initialHasMore={initialResult.hasMore}
            searchQuery={searchQuery}
            limit={LIMIT}
          />
        </div>

      </main>
    </div>
  );
}