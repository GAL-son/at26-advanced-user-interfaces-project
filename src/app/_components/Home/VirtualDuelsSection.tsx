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
          /* Zmiana: h-full w połączeniu z min-h-max zabezpiecza wysokość bazową (top+middle+bottom) */
          className="group relative flex flex-col p-4 rounded-xl bg-brand-navy-dark border border-brand-navy-light/60 focus-brand focus-within:border-brand-yellow-hover focus-within:bg-brand-navy-light/30 hover:border-brand-yellow-hover hover:bg-brand-navy-light/30 overflow-hidden h-full min-h-max transition-colors duration-300"
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
          <div className="flex flex-col h-full w-full" aria-hidden="true">

            {/* SEKCJA TOP */}
            <div className="flex items-center justify-between mb-0 flex-shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-text-muted opacity-80">
                {categoryName}
              </span>
              <span className="bg-brand-navy px-2 py-0.5 rounded text-brand-text-muted !text-btn-mono">
                Δ ELO: {duel.eloDifference}
              </span>
            </div>

            {/* SEKCJA MIDDLE */}
            <div className="grid grid-cols-7 items-center gap-3 w-full py-2 flex-grow min-h-0">

              {/* KIEROWCA A */}
              <div className="col-span-3 flex items-center justify-end gap-2.5 min-w-0">
                <span className="text-brand-text group-hover:text-brand-yellow-hover group-focus-within:text-brand-yellow-hover transition-colors duration-300 line-clamp-1 text-right flex-1 !text-duel-name">
                  {duel.driverA.mainName}
                </span>
                {/* Jawnym flex-row dla małych ekranów i STRIKTNYM lg:flex-col dla dużych */}
                <div className="flex flex-row items-center gap-1.5 flex-shrink-0 lg:flex-col lg:items-end lg:justify-center lg:gap-1">
                  <span className="text-brand-yellow-text bg-brand-navy px-1.5 py-0.5 rounded border border-brand-navy-light/40 !text-btn-mono flex-shrink-0">
                    {Math.round(duel.driverA.currentElo)}
                  </span>
                  {duel.driverA.combo > 0 && (
                    <div className="scale-90 lg:scale-100 flex items-center justify-end flex-shrink-0">
                      <ComboBadge combo={duel.driverA.combo} />
                    </div>
                  )}
                </div>
              </div>

              {/* SEPARATOR VS */}
              <div className="col-span-1 flex items-center justify-center flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-brand-navy border border-brand-navy-light flex items-center justify-center font-black italic text-xs text-brand-yellow-hover transition-all duration-300 shadow-md z-10 group-hover:border-brand-yellow-hover group-focus-within:border-brand-yellow-hover">
                  VS
                </div>
              </div>

              {/* KIEROWCA B */}
              <div className="col-span-3 flex items-center justify-start gap-2.5 min-w-0">
                {/* Jawnym flex-row dla małych ekranów i STRIKTNYM lg:flex-col dla dużych */}
                <div className="flex flex-row items-center gap-1.5 flex-shrink-0 lg:flex-col lg:items-start lg:justify-center lg:gap-1">
                  <span className="text-brand-yellow-text bg-brand-navy px-1.5 py-0.5 rounded border border-brand-navy-light/40 !text-btn-mono flex-shrink-0">
                    {Math.round(duel.driverB.currentElo)}
                  </span>
                  {duel.driverB.combo > 0 && (
                    <div className="scale-90 lg:scale-100 flex items-center justify-start flex-shrink-0">
                      <ComboBadge combo={duel.driverB.combo} />
                    </div>
                  )}
                </div>
                <span className="text-brand-text group-hover:text-brand-yellow-hover group-focus-within:text-brand-yellow-hover transition-colors duration-300 line-clamp-1 flex-1 text-left !text-duel-name">
                  {duel.driverB.mainName}
                </span>
              </div>

            </div>

            {/* SEKCJA BOTTOM (Animacja Hover zostaje nienaruszona) */}
            <div className="h2h-reveal grid grid-rows-[0fr] group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr] transition-grid w-full flex-shrink-0">
              <div className="overflow-hidden">
                <div className="mt-0 border-t border-brand-navy-light/40 text-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 ease-in-out delay-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-yellow-hover">
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
        <SwordsIcon className="text-brand-yellow-hover" aria-hidden="true" />
        {/* Zmiana na ujednolicony token globalnego nagłówka */}
        <h2
          id="duels-heading"
          className="!text-page-title uppercase text-brand-text"
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