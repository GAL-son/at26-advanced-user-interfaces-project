// Sprawdź, czy na samej górze tego pliku NIE MA dyrektywy "use client"
import React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ChampionshipDto } from "@/lib/services/championships.service";
import EventCard from "@/app/_components/Championships/EventCard";
import DynamicGrid from "@/app/_components/Common/DynamicGrid";

interface Props {
  championship: ChampionshipDto;
  searchParams: { search?: string };
}

export default async function ChampionshipDetailsPage({ championship, searchParams }: Props) {
  const t = await getTranslations("Events");

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[var(--color-brand-navy)] text-[var(--color-brand-text)] transition-colors duration-300">
      <main className="max-w-5xl mx-auto">
        
        {/* LINK POWROTU */}
        <Link 
          href="/championships" 
          className="inline-flex items-center gap-2 mb-8 text-btn-mono uppercase text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-yellow)] transition-colors focus-brand rounded-xs"
        >
          &larr; {t("buttons.back") || "Powrót do mistrzostw"}
        </Link>

        {/* HERO SECTION MISTRZOSTWA */}
        <header className="mb-12" data-section="championship-hero">
          <div className="flex items-center gap-4 mb-2">
            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-[var(--color-brand-yellow)] text-[var(--color-brand-navy)] rounded-xs">
              Championship
            </span>
          </div>
          
          <h1 className="text-page-title text-4xl sm:text-5xl md:text-6xl leading-tight">
            {championship.name}
          </h1>
          
          {/* ... reszta metadanych bez zmian ... */}
        </header>

        {/* HARMONOGRAM WYŚCIGÓW */}
        <section aria-labelledby="schedule-heading">
          <h2 id="schedule-heading" className="text-xl sm:text-2xl font-display font-bold uppercase mb-6 flex items-center gap-4 text-[var(--color-brand-text)]">
            {t("championship.schedule") || "Harmonogram wyścigów"}
            <span className="h-[1px] flex-1 bg-[var(--color-brand-navy-light)]/30"></span>
          </h2>

          {/* Przekazujemy tablicę wyrenderowanych komponentów jako children */}
          <DynamicGrid>
            {championship.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </DynamicGrid>
        </section>

      </main>
    </div>
  );
}