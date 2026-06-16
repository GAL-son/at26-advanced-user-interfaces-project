"use client";

import React, { useRef } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import ComboBadge from "../Elo/ComboBadge";
import { ExtendedDriver } from "@/lib/services/drivers";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

interface TopDriversLeaderboardProps {
  drivers: ExtendedDriver[];
  onNavigateHorizontal?: (direction: "prev" | "next") => void;
}

export default function TopDriversLeaderboard({ drivers, onNavigateHorizontal }: TopDriversLeaderboardProps) {
  const t = useTranslations("Home");

  // 🎯 WCAG/REACT PROTIP: Tablica referencji zamiast pobierania elementów przez document.getElementById
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  if (!drivers || drivers.length === 0) return null;

  const p1 = drivers.find(d => d.position === 1);
  const p2 = drivers.find(d => d.position === 2);
  const p3 = drivers.find(d => d.position === 3);

  // Bezpieczne filtrowanie podium (zapobiega crashom przy niekompletnych danych)
  const visualPodiumOrder = [p2, p1, p3].filter((d): d is ExtendedDriver => !!d);
  const remainingDrivers = drivers.slice(3, 5);

  // Pełna, spłaszczona lista elementów dokładnie w kolejności ich renderowania w DOM
  const domRenderOrder = [...visualPodiumOrder, ...remainingDrivers];

  const handleCustomKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let targetIndex = -1;

    if (currentIndex <= 2) {
      // --- NAWIGACJA NA PODIUM (indeksy 0: P2, 1: P1, 2: P3) ---
      if (e.key === "ArrowRight") {
        if (currentIndex < 2) targetIndex = currentIndex + 1; // Przejście w prawo po strukturze podium
        else if (onNavigateHorizontal) onNavigateHorizontal("next");
      } else if (e.key === "ArrowLeft") {
        if (currentIndex > 0) targetIndex = currentIndex - 1; // Przejście w lewo po strukturze podium
        else if (onNavigateHorizontal) onNavigateHorizontal("prev");
      } else if (e.key === "ArrowDown") {
        // Skok z dowolnego miejsca podium na pierwsze miejsce listy poniżej (Pozycja 4, indeks 3)
        if (domRenderOrder[3]) targetIndex = 3;
      } else if (e.key === "ArrowUp") {
        if (onNavigateHorizontal) onNavigateHorizontal("prev");
      }
    } else {
      // --- NAWIGACJA NA LIŚCIE PONIŻEJ (indeksy 3: P4, 4: P5) ---
      if (e.key === "ArrowDown") {
        if (currentIndex === 3 && domRenderOrder[4]) targetIndex = 4; // P4 -> P5
        else if (onNavigateHorizontal) onNavigateHorizontal("next");
      } else if (e.key === "ArrowUp") {
        if (currentIndex === 4) targetIndex = 3; // P5 -> P4
        else targetIndex = 1; // Z najwyższego elementu listy (P4) wracamy na środek podium (Zwycięzca - P1)
      } else if (e.key === "ArrowLeft") {
        if (onNavigateHorizontal) onNavigateHorizontal("prev");
      } else if (e.key === "ArrowRight") {
        if (onNavigateHorizontal) onNavigateHorizontal("next");
      }
    }

    // Jeśli wyznaczyliśmy prawidłowy indeks docelowy, wywołujemy focus przez tablicę referencji Reacta
    if (targetIndex !== -1 && itemRefs.current[targetIndex]) {
      e.preventDefault();
      itemRefs.current[targetIndex]?.focus();
    }
  };

  const getPodiumStyles = (position: number) => {
    switch (position) {
      case 1:
        return {
          bg: "bg-[var(--color-brand-navy-light)] border-[var(--color-brand-yellow-hover)]",
          text: "text-[var(--color-brand-yellow-hover)]",
          height: "h-40 sm:h-48",
        };
      case 2:
        return {
          bg: "bg-[var(--color-brand-navy-dark)] border-[var(--color-brand-border-muted,rgba(148,163,184,0.4))]",
          text: "text-slate-300",
          height: "h-32 sm:h-36",
        };
      case 3:
        return {
          bg: "bg-[var(--color-brand-navy-dark)] border-[var(--color-brand-border-bronze,rgba(180,83,9,0.4))]",
          text: "text-amber-600",
          height: "h-24 sm:h-28",
        };
      default:
        return { bg: "", text: "", height: "" };
    }
  };

  return (
    <section
      className="w-full my-8 bg-[var(--color-brand-navy-dark)]/30 rounded-xl p-4 sm:p-6 border border-[var(--color-brand-navy-light)]/40 focus:outline-none"
      aria-labelledby="leaderboard-heading"
    >
      <div className="flex items-center gap-2 mb-6">
        <EmojiEventsIcon className="text-[var(--color-brand-yellow-hover)]" aria-hidden="true" />
        <h2 id="leaderboard-heading" className="text-xl sm:text-2xl font-black uppercase tracking-wide text-[var(--color-brand-text)]">
          {t("topDrivers")}
        </h2>
      </div>

      <ol className="list-none p-0 m-0 max-w-2xl mx-auto" aria-label="Leaderboard standings">

        {/* SEKCJA: PODIUM */}
        <li className="w-full mb-6 pt-4 border-b border-[var(--color-brand-navy-light)]/60">
          <div className="flex items-end justify-center gap-2 sm:gap-4" role="group" aria-label={t("podiumAriaLabel")}>
            {visualPodiumOrder.map((driver, index) => {
              const styles = getPodiumStyles(driver.position);
              // Ponieważ podium jest pierwsze, jego indeksy w domRenderOrder odpowiadają iteracji (0, 1, 2)
              const domIndex = index;

              return (
                <Link
                  key={driver.guid}
                  href={`/drivers/${driver.guid}`}
                  ref={(el) => { itemRefs.current[domIndex] = el; }} // Przypisanie referencji
                  onKeyDown={(e) => handleCustomKeyDown(e, domIndex)}
                  tabIndex={0}
                  data-focus-order={driver.position === 1 ? "primary" : undefined}
                  className={`flex-1 flex flex-col justify-end items-center text-center p-3 rounded-t-lg border-t border-x h-auto transition-all duration-200 hover:translate-y-[-4px] hover:bg-[var(--color-brand-navy-light)]/40 focus-brand group ${styles.bg}`}
                  aria-label={`Position ${driver.position}: ${driver.mainName}. Elo rating: ${Math.round(driver.currentElo)}`}
                >
                  <div className="flex flex-col items-center gap-1 mb-3 w-full" aria-hidden="true">
                    <span className="font-bold text-xs sm:text-sm text-[var(--color-brand-text)] line-clamp-1 group-hover:text-[var(--color-brand-yellow-hover)]">
                      {driver.mainName}
                    </span>
                    <span className="font-mono text-xs font-bold text-[var(--color-brand-yellow-text)] bg-[var(--color-brand-navy)] px-1.5 py-0.5 rounded">
                      {Math.round(driver.currentElo)}
                    </span>
                    {driver.combo > 0 && (
                      <div className="scale-90 origin-center">
                        <ComboBadge combo={driver.combo} />
                      </div>
                    )}
                  </div>

                  <div className={`w-full flex items-center justify-center font-black text-2xl sm:text-4xl ${styles.text} ${styles.height} bg-[var(--color-brand-navy)]/50 rounded-t-sm border-t border-[var(--color-brand-navy-light)]/20 shadow-inner`} aria-hidden="true">
                    {driver.position}
                  </div>
                </Link>
              );
            })}
          </div>
        </li>

        {/* SEKCJA: MIEJSCA 4-5 */}
        {remainingDrivers.map((driver, index) => {
          // Dynamicznie obliczamy indeks dla listy pod podium (indeks startuje od 3)
          const domIndex = visualPodiumOrder.length + index;

          return (
            <li key={driver.guid} className="mb-2">
              <Link
                href={`/drivers/${driver.guid}`}
                ref={(el) => { itemRefs.current[domIndex] = el; }} // Przypisanie referencji
                onKeyDown={(e) => handleCustomKeyDown(e, domIndex)}
                tabIndex={0}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-brand-navy-dark)] border border-[var(--color-brand-navy-light)]/60 transition-all focus-brand hover:bg-[var(--color-brand-navy-light)] hover:border-[var(--color-brand-yellow-hover)] group"
                aria-label={`Position ${driver.position}: ${driver.mainName}. Elo rating: ${Math.round(driver.currentElo)}`}
              >
                <div className="flex items-center gap-4" aria-hidden="true">
                  <span className="font-mono font-black text-sm text-[var(--color-brand-text-muted)] w-4 text-center">
                    {driver.position}
                  </span>
                  <span className="font-semibold text-sm text-[var(--color-brand-text)] group-hover:text-[var(--color-brand-yellow-hover)]">
                    {driver.mainName}
                  </span>
                </div>

                <div className="flex items-center gap-3" aria-hidden="true">
                  {driver.combo > 0 && <ComboBadge combo={driver.combo} />}
                  <span className="font-mono font-bold text-xs text-[var(--color-brand-yellow-text)] bg-[var(--color-brand-navy)] px-2 py-0.5 rounded border border-[var(--color-brand-navy-light)]">
                    {Math.round(driver.currentElo)}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}