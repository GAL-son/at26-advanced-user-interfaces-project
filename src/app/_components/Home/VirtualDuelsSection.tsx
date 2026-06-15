"use client";

import React from "react";
import Link from "next/link";
import ComboBadge from "../Elo/ComboBadge";
import { DashboardDuels, VirtualDuel } from "@/lib/services/duels";
import SwordsIcon from "@mui/icons-material/FlashOn";

interface VirtualDuelsSectionProps {
  duels: DashboardDuels;
}

export default function VirtualDuelsSection({
  duels,
}: VirtualDuelsSectionProps) {
  const hasAnyDuel = duels.top || duels.midfield || duels.rookies;
  if (!hasAnyDuel) return null;

  // ... reszta kodu bez zmian

  const renderDuelCard = (duel: VirtualDuel | null) => {
    if (!duel) return null;

    const compareUrl = `/drivers/compare?guids=${duel.driverA.guid},${duel.driverB.guid}`;

    return (
      <Link
        key={duel.categoryKey}
        href={compareUrl}
        className="group relative flex flex-col p-4 rounded-xl bg-[var(--color-brand-navy-dark)] border border-[var(--color-brand-navy-light)]/60 hover:border-[var(--color-brand-yellow-hover)] hover:bg-[var(--color-brand-navy-light)]/30 overflow-hidden flex-1 h-full transition-colors duration-300"
      >
        {/* SEKCJA TOP */}
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-text-muted)] opacity-80">
            {duel.categoryName}
          </span>
          <span className="font-mono text-[10px] bg-[var(--color-brand-navy)] px-2 py-0.5 rounded text-[var(--color-brand-text-muted)]">
            Δ ELO: {duel.eloDifference}
          </span>
        </div>

        {/* SEKCJA MIDDLE: Usunięto transition-all, skurczy się naturalnie i płynnie */}
        <div className="grid grid-cols-7 items-center gap-3 w-full py-2 flex-1 min-h-0">
          {/* LEWA STRONA: Kierowca A */}
          <div className="col-span-3 flex items-center justify-end gap-3 min-w-0">
            <span className="font-black text-lg sm:text-xl md:text-2xl text-[var(--color-brand-text)] group-hover:text-[var(--color-brand-yellow-hover)] transition-colors duration-300 line-clamp-1 text-right flex-1">
              {duel.driverA.mainName}
            </span>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="font-mono text-xs font-bold text-[var(--color-brand-yellow-text)] bg-[var(--color-brand-navy)] px-1.5 py-0.5 rounded border border-[var(--color-brand-navy-light)]/40">
                {Math.round(duel.driverA.currentElo)}
              </span>
              {duel.driverA.combo > 0 && (
                <div className="scale-90 origin-right">
                  <ComboBadge combo={duel.driverA.combo} />
                </div>
              )}
            </div>
          </div>

          {/* ŚRODEK: Kółko VS */}
          <div className="col-span-1 flex items-center justify-center flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-[var(--color-brand-navy)] border border-[var(--color-brand-navy-light)] flex items-center justify-center font-black italic text-xs text-[var(--color-brand-yellow-hover)] transition-transform duration-300 ease-in-out group-hover:scale-110 shadow-md z-10">
              VS
            </div>
          </div>

          {/* PRAWA STRONA: Kierowca B */}
          <div className="col-span-3 flex items-center justify-start gap-3 min-w-0">
            <div className="flex flex-col items-start gap-1 flex-shrink-0">
              <span className="font-mono text-xs font-bold text-[var(--color-brand-yellow-text)] bg-[var(--color-brand-navy)] px-1.5 py-0.5 rounded border border-[var(--color-brand-navy-light)]/40">
                {Math.round(duel.driverB.currentElo)}
              </span>
              {duel.driverB.combo > 0 && (
                <div className="scale-90 origin-left">
                  <ComboBadge combo={duel.driverB.combo} />
                </div>
              )}
            </div>
            <span className="font-black text-lg sm:text-xl md:text-2xl text-[var(--color-brand-text)] group-hover:text-[var(--color-brand-yellow-hover)] transition-colors duration-300 line-clamp-1 flex-1 text-left">
              {duel.driverB.mainName}
            </span>
          </div>
        </div>

        {/* SEKCJA BOTTOM */}
        <div className="h2h-reveal grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-grid duration-300 ease-in-out w-full">
          <div className="overflow-hidden">
            <div className="pt-2 mt-2 border-t border-[var(--color-brand-navy-light)]/40 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out delay-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-yellow-hover)]">
                Zobacz porównanie h2h &rarr;
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <section
      className="w-full h-full flex flex-col animate-fadeIn"
      aria-labelledby="duels-heading"
    >
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <SwordsIcon className="text-[var(--color-brand-yellow-hover)]" />
        <h2
          id="duels-heading"
          className="text-xl sm:text-2xl font-black uppercase tracking-wide text-[var(--color-brand-text)]"
        >
          Duels
        </h2>
      </div>

      <div className="flex flex-col gap-4 xl:gap-6 flex-1 min-h-0">
        {renderDuelCard(duels.top)}
        {renderDuelCard(duels.midfield)}
        {renderDuelCard(duels.rookies)}
      </div>
    </section>
  );
}
