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

    const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    if (!drivers || drivers.length === 0) return null;

    const p1 = drivers.find(d => d.position === 1);
    const p2 = drivers.find(d => d.position === 2);
    const p3 = drivers.find(d => d.position === 3);

    const visualPodiumOrder = [p2, p1, p3].filter((d): d is ExtendedDriver => !!d);
    const remainingDrivers = drivers.slice(3, 5);

    const domRenderOrder = [...visualPodiumOrder, ...remainingDrivers];

    const handleCustomKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
      let targetIndex = -1;

      if (currentIndex <= 2) {
        if (e.key === "ArrowRight") {
          if (currentIndex < 2) targetIndex = currentIndex + 1;
          else if (onNavigateHorizontal) onNavigateHorizontal("next");
        } else if (e.key === "ArrowLeft") {
          if (currentIndex > 0) targetIndex = currentIndex - 1;
          else if (onNavigateHorizontal) onNavigateHorizontal("prev");
        } else if (e.key === "ArrowDown") {
          if (domRenderOrder[3]) targetIndex = 3;
        } else if (e.key === "ArrowUp") {
          if (onNavigateHorizontal) onNavigateHorizontal("prev");
        }
      } else {
        if (e.key === "ArrowDown") {
          if (currentIndex === 3 && domRenderOrder[4]) targetIndex = 4;
          else if (onNavigateHorizontal) onNavigateHorizontal("next");
        } else if (e.key === "ArrowUp") {
          if (currentIndex === 4) targetIndex = 3;
          else targetIndex = 1;
        } else if (e.key === "ArrowLeft") {
          if (onNavigateHorizontal) onNavigateHorizontal("prev");
        } else if (e.key === "ArrowRight") {
          if (onNavigateHorizontal) onNavigateHorizontal("next");
        }
      }

      if (targetIndex !== -1 && itemRefs.current[targetIndex]) {
        e.preventDefault();
        itemRefs.current[targetIndex]?.focus();
      }
    };

    const getPodiumStyles = (position: number) => {
      switch (position) {
        case 1:
          return {
            bg: "bg-brand-navy-light border-brand-yellow-hover",
            text: "text-brand-yellow-hover",
            height: "h-40 sm:h-48",
          };
        case 2:
          return {
            bg: "bg-brand-navy-dark border-brand-navy-light/40",
            text: "text-slate-300",
            height: "h-32 sm:h-36",
          };
        case 3:
          return {
            bg: "bg-brand-navy-dark border-amber-900/40",
            text: "text-amber-600",
            height: "h-24 sm:h-28",
          };
        default:
          return { bg: "", text: "", height: "" };
      }
    };

    return (
      <section
        className="w-full h-full flex flex-col 
        "
        aria-labelledby="leaderboard-heading"
      >
        <div className="flex items-center gap-2 mb-4">
          <EmojiEventsIcon className="text-brand-yellow-hover" aria-hidden="true" />
          {/* Zmiana na ujednolicony nagłówek z wagą zapisaną w CSS */}
          <h2 id="leaderboard-heading" className="!text-page-title uppercase text-brand-text">
            {t("topDrivers")}
          </h2>
        </div>

        <ol className="list-none max-w-2xl mx-auto w-full flex-1 bg-brand-navy-dark/30 rounded-xl p-4 sm:p-6 border border-brand-navy-light/40 focus:outline-none" aria-label="Leaderboard standings" >

          {/* SEKCJA: PODIUM */}
          <li className="w-full mb-6 pt-4 border-b border-brand-navy-light/60">
            <div className="flex items-end justify-center gap-2 sm:gap-4" role="group" aria-label={t("podiumAriaLabel")}>
              {visualPodiumOrder.map((driver, index) => {
                const styles = getPodiumStyles(driver.position);
                const domIndex = index;

                return (
                  <Link
                    key={driver.guid}
                    href={`/drivers/${driver.guid}`}
                    ref={(el) => { itemRefs.current[domIndex] = el; }}
                    onKeyDown={(e) => handleCustomKeyDown(e, domIndex)}
                    tabIndex={0}
                    data-focus-order={driver.position === 1 ? "primary" : undefined}
                    className={`flex-1 flex flex-col justify-end items-center text-center p-3 rounded-t-lg border-t border-x h-auto transition-all duration-200 hover:translate-y-[-4px] hover:bg-brand-navy-light/40 focus-brand group ${styles.bg}`}
                    aria-label={`Position ${driver.position}: ${driver.mainName}. Elo rating: ${Math.round(driver.currentElo)}`}
                  >
                    <div className="flex flex-col items-center gap-1 mb-3 w-full" aria-hidden="true">
                      <span className="font-bold text-xs sm:text-sm text-brand-text line-clamp-1 group-hover:text-brand-yellow-hover">
                        {driver.mainName}
                      </span>
                      {/* Zmiana na !text-btn-mono */}
                      <span className="text-brand-yellow-text bg-brand-navy px-1.5 py-0.5 rounded !text-btn-mono">
                        {Math.round(driver.currentElo)}
                      </span>
                      {driver.combo > 0 && (
                        <div className="scale-90 origin-center">
                          <ComboBadge combo={driver.combo} />
                        </div>
                      )}
                    </div>

                    {/* Zmiana wielkich cyfr na nową klasę !text-podium-number */}
                    <div className={`w-full flex items-center justify-center !text-podium-number ${styles.text} ${styles.height} bg-brand-navy/50 rounded-t-sm border-t border-brand-navy-light/20 shadow-inner`} aria-hidden="true">
                      {driver.position}
                    </div>
                  </Link>
                );
              })}
            </div>
          </li>

          {/* SEKCJA: MIEJSCA 4-5 */}
          {remainingDrivers.map((driver, index) => {
            const domIndex = visualPodiumOrder.length + index;

            return (
              <li key={driver.guid} className="mb-2">
                <Link
                  href={`/drivers/${driver.guid}`}
                  ref={(el) => { itemRefs.current[domIndex] = el; }}
                  onKeyDown={(e) => handleCustomKeyDown(e, domIndex)}
                  tabIndex={0}
                  className="flex items-center justify-between p-3 rounded-lg bg-brand-navy-dark border border-brand-navy-light/60 transition-all focus-brand hover:bg-brand-navy-light hover:border-brand-yellow-hover group"
                  aria-label={`Position ${driver.position}: ${driver.mainName}. Elo rating: ${Math.round(driver.currentElo)}`}
                >
                  <div className="flex items-center gap-4" aria-hidden="true">
                    {/* Indeks pozycji kierowcy 4-5 traktujemy klasą !text-btn-mono */}
                    <span className="text-brand-text-muted w-4 text-center !text-btn-mono">
                      {driver.position}
                    </span>
                    <span className="font-semibold text-sm text-brand-text group-hover:text-brand-yellow-hover">
                      {driver.mainName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3" aria-hidden="true">
                    {driver.combo > 0 && <ComboBadge combo={driver.combo} />}
                    {/* Punkty ELO na liście zsynchronizowane za pomocą !text-btn-mono */}
                    <span className="text-brand-yellow-text bg-brand-navy px-2 py-0.5 rounded border border-brand-navy-light !text-btn-mono">
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