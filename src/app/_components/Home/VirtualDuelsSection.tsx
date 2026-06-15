"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import ComboBadge from "../Elo/ComboBadge";
import { DashboardDuels, VirtualDuel } from "@/lib/services/duels";
import SwordsIcon from "@mui/icons-material/FlashOn";
import { useKeyboardNavigation } from "@/app/_hooks/useKeyboardNavigation";
import { Box } from "@mui/material";

interface VirtualDuelsSectionProps {
  duels: DashboardDuels;
  onNavigateHorizontal?: (direction: "prev" | "next") => void;
}

export default function VirtualDuelsSection({
  duels,
  onNavigateHorizontal,
}: VirtualDuelsSectionProps) {
  const t = useTranslations("Home");

  const availableDuels = [duels.top, duels.midfield, duels.rookies].filter(
    (duel): duel is VirtualDuel => duel !== null
  );

  const { registerItem, handleKeyDown } = useKeyboardNavigation({
    itemCount: availableDuels.length,
    orientation: "vertical",
    loop: false,
    onLeave: (direction) => {
      if (onNavigateHorizontal) {
        onNavigateHorizontal(direction);
      }
    },
  });

  const hasAnyDuel = availableDuels.length > 0;
  if (!hasAnyDuel) return null;

  const renderDuelCard = (duel: VirtualDuel | null) => {
    if (!duel) return null;

    const duelIndex = availableDuels.findIndex((d) => d.categoryKey === duel.categoryKey);
    const compareUrl = `/drivers/compare?guids=${duel.driverA.guid},${duel.driverB.guid}`;
    const categoryName = t(`categories.${duel.categoryKey}`);

    return (
      <li key={duel.categoryKey} className="flex-1 min-h-0">
        <Link
          href={compareUrl}
          ref={registerItem(duelIndex)}
          onKeyDown={(e) => handleKeyDown(e, duelIndex)}
          tabIndex={0}
          className="group relative flex flex-col p-4 rounded-xl bg-[var(--color-brand-navy-dark)] border border-[var(--color-brand-navy-light)]/60 focus-brand focus-within:border-[var(--color-brand-yellow-hover)] focus-within:bg-[var(--color-brand-navy-light)]/30 hover:border-[var(--color-brand-yellow-hover)] hover:bg-[var(--color-brand-navy-light)]/30 overflow-hidden h-full transition-colors duration-300"
          // 🌐 Wszystkie człony opisu ARIA zostały przeniesione do jednej zmiennej lokalizacyjnej z parametrami dynamicznymi
          aria-label={t("duelAriaLabel", {
            category: categoryName,
            driverA: duel.driverA.mainName,
            eloA: Math.round(duel.driverA.currentElo),
            driverB: duel.driverB.mainName,
            eloB: Math.round(duel.driverB.currentElo),
            diff: duel.eloDifference,
            action: t("viewH2h")
          })}
        >
          {/* Wizualna zawartość ukryta dla czytników ekranu - opis przekazuje aria-label */}
          <div className="flex flex-col h-full w-full" aria-hidden="true">
            
            {/* SEKCJA TOP */}
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-text-muted)] opacity-80">
                {categoryName}
              </span>
              <span className="font-mono text-[10px] bg-[var(--color-brand-navy)] px-2 py-0.5 rounded text-[var(--color-brand-text-muted)]">
                Δ ELO: {duel.eloDifference}
              </span>
            </div>

            {/* SEKCJA MIDDLE */}
            <div className="grid grid-cols-7 items-center gap-3 w-full py-2 flex-1 min-h-0">
              
              {/* KIEROWCA A */}
              <div className="col-span-3 flex items-center justify-end gap-2.5 min-w-0">
                <span className="font-black text-lg sm:text-xl md:text-2xl text-[var(--color-brand-text)] group-hover:text-[var(--color-brand-yellow-hover)] group-focus-within:text-[var(--color-brand-yellow-hover)] transition-colors duration-300 line-clamp-1 text-right flex-1">
                  {duel.driverA.mainName}
                </span>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="font-mono text-xs font-bold text-[var(--color-brand-yellow-text)] bg-[var(--color-brand-navy)] px-1.5 py-0.5 rounded border border-[var(--color-brand-navy-light)]/40">
                    {Math.round(duel.driverA.currentElo)}
                  </span>
                  {duel.driverA.combo > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                      <ComboBadge combo={duel.driverA.combo} />
                    </Box>
                  )}
                </div>
              </div>

              {/* SEPARATOR VS */}
              <div className="col-span-1 flex items-center justify-center flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-[var(--color-brand-navy)] border border-[var(--color-brand-navy-light)] flex items-center justify-center font-black italic text-xs text-[var(--color-brand-yellow-hover)] transition-all duration-300 shadow-md z-10 group-hover:border-[var(--color-brand-yellow-hover)] group-focus-within:border-[var(--color-brand-yellow-hover)]">
                  VS
                </div>
              </div>

              {/* KIEROWCA B */}
              <div className="col-span-3 flex items-center justify-start gap-2.5 min-w-0">
                <div className="flex flex-col items-start gap-1 flex-shrink-0">
                  <span className="font-mono text-xs font-bold text-[var(--color-brand-yellow-text)] bg-[var(--color-brand-navy)] px-1.5 py-0.5 rounded border border-[var(--color-brand-navy-light)]/40">
                    {Math.round(duel.driverB.currentElo)}
                  </span>
                  {duel.driverB.combo > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
                      <ComboBadge combo={duel.driverB.combo} />
                    </Box>
                  )}
                </div>
                <span className="font-black text-lg sm:text-xl md:text-2xl text-[var(--color-brand-text)] group-hover:text-[var(--color-brand-yellow-hover)] group-focus-within:text-[var(--color-brand-yellow-hover)] transition-colors duration-300 line-clamp-1 flex-1 text-left">
                  {duel.driverB.mainName}
                </span>
              </div>
              
            </div>

            {/* SEKCJA BOTTOM */}
            <div className="h2h-reveal grid grid-rows-[0fr] group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr] transition-grid duration-300 ease-in-out w-full">
              <div className="overflow-hidden">
                <div className="pt-2 mt-2 border-t border-[var(--color-brand-navy-light)]/40 text-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 ease-in-out delay-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-yellow-hover)]">
                    {t("viewH2h")} &rarr;
                  </span>
                </div>
              </div>
            </div>

          </div>
        </Link>
      </li>
    );
  };

  return (
    <section
      className="w-full h-full flex flex-col animate-fadeIn focus:outline-none"
      aria-labelledby="duels-heading"
    >
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <SwordsIcon className="text-[var(--color-brand-yellow-hover)]" aria-hidden="true" />
        <h2
          id="duels-heading"
          className="text-xl sm:text-2xl font-black uppercase tracking-wide text-[var(--color-brand-text)]"
        >
          {t("virtualDuels")}
        </h2>
      </div>

      <ul className="flex flex-col gap-4 xl:gap-6 flex-1 min-h-0 list-none p-0 m-0">
        {renderDuelCard(duels.top)}
        {renderDuelCard(duels.midfield)}
        {renderDuelCard(duels.rookies)}
      </ul>
    </section>
  );
}