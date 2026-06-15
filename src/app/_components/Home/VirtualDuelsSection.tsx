"use client";

import React from "react";
import Link from "next/link";
import ComboBadge from "../Elo/ComboBadge";
import { DashboardDuels, VirtualDuel } from "@/lib/services/duels";
import SwordsIcon from "@mui/icons-material/FlashOn"; // Drapieżna ikona błyskawicy/starcia

interface VirtualDuelsSectionProps {
  duels: DashboardDuels;
}

export default function VirtualDuelsSection({ duels }: VirtualDuelsSectionProps) {
  // Sprawdzamy, czy w ogóle mamy jakikolwiek pojedynek do wyświetlenia
  const hasAnyDuel = duels.top || duels.midfield || duels.rookies;
  if (!hasAnyDuel) return null;

  // Helper do renderowania pojedynczej karty pojedynku
  const renderDuelCard = (duel: VirtualDuel | null) => {
    if (!duel) return null;

    // Generujemy link do porównywarki na podstawie GUIDów obu kierowców
    const compareUrl = `/drivers/compare?guids=${duel.driverA.guid},${duel.driverB.guid}`;

    return (
      <Link
        key={duel.categoryKey}
        href={compareUrl}
        className="group relative flex flex-col justify-between p-5 rounded-xl bg-[var(--color-brand-navy-dark)] border border-[var(--color-brand-navy-light)]/60 transition-all duration-200 hover:border-[var(--color-brand-yellow-hover)] hover:bg-[var(--color-brand-navy-light)]/30 hover:translate-y-[-2px]"
      >
        {/* Góra karty: Nazwa kategorii */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-text-muted)] opacity-80">
            {duel.categoryName}
          </span>
          <span className="font-mono text-[10px] bg-[var(--color-brand-navy)] px-2 py-0.5 rounded text-[var(--color-brand-text-muted)]">
            Δ ELO: {duel.eloDifference}
          </span>
        </div>

        {/* Środek karty: Starcie kierowców (Grid 3-kolumnowy) */}
        <div className="grid grid-cols-7 items-center gap-2 my-2 w-full">
          
          {/* Kierowca A (Po lewej) */}
          <div className="col-span-3 flex flex-col items-end text-right min-w-0">
            <span className="font-bold text-sm sm:text-base text-[var(--color-brand-text)] group-hover:text-[var(--color-brand-yellow-hover)] transition-colors line-clamp-1">
              {duel.driverA.mainName}
            </span>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap justify-end">
              {duel.driverA.combo > 0 && <ComboBadge combo={duel.driverA.combo} />}
              <span className="font-mono text-xs font-bold text-[var(--color-brand-yellow-text)] bg-[var(--color-brand-navy)] px-1.5 py-0.5 rounded">
                {Math.round(duel.driverA.currentElo)}
              </span>
            </div>
          </div>

          {/* Znacznik VS (Środek) */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[var(--color-brand-navy)] border border-[var(--color-brand-navy-light)] flex items-center justify-center font-black italic text-xs text-[var(--color-brand-yellow-hover)] group-hover:scale-110 transition-transform shadow-md">
              VS
            </div>
          </div>

          {/* Kierowca B (Po prawej) */}
          <div className="col-span-3 flex flex-col items-start text-left min-w-0">
            <span className="font-bold text-sm sm:text-base text-[var(--color-brand-text)] group-hover:text-[var(--color-brand-yellow-hover)] transition-colors line-clamp-1">
              {duel.driverB.mainName}
            </span>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap justify-start">
              <span className="font-mono text-xs font-bold text-[var(--color-brand-yellow-text)] bg-[var(--color-brand-navy)] px-1.5 py-0.5 rounded">
                {Math.round(duel.driverB.currentElo)}
              </span>
              {duel.driverB.combo > 0 && <ComboBadge combo={duel.driverB.combo} />}
            </div>
          </div>

        </div>

        {/* Dół karty: Wezwanie do akcji */}
        <div className="mt-4 pt-3 border-t border-[var(--color-brand-navy-light)]/40 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-brand-yellow-hover)] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Zobacz porównanie h2h &rarr;
          </span>
        </div>
      </Link>
    );
  };

  return (
    <section 
      className="w-full my-8 animate-fadeIn"
      aria-labelledby="duels-heading"
    >
      {/* Nagłówek sekcji */}
      <div className="flex items-center gap-2 mb-4">
        <SwordsIcon className="text-[var(--color-brand-yellow-hover)]" />
        <h2 
          id="duels-heading" 
          className="text-xl sm:text-2xl font-black uppercase tracking-wide text-[var(--color-brand-text)]"
        >
          Duels
        </h2>
      </div>

      {/* Siatka z pojedynkami (Renders 1, 2 lub 3 kolumny w zależności od dostępności danych) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderDuelCard(duels.top)}
        {renderDuelCard(duels.midfield)}
        {renderDuelCard(duels.rookies)}
      </div>
    </section>
  );
}