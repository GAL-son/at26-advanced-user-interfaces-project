"use client";

import React from "react";
import Link from "next/link";
import ComboBadge from "../Elo/ComboBadge";
import { ExtendedDriver } from "@/lib/services/drivers";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useKeyboardNavigation } from "@/app/_hooks/useKeyboardNavigation";

interface TopDriversLeaderboardProps {
  drivers: ExtendedDriver[];
  onNavigateHorizontal?: (direction: "prev" | "next") => void;
}

export default function TopDriversLeaderboard({ drivers, onNavigateHorizontal }: TopDriversLeaderboardProps) {
  const { registerItem, handleKeyDown } = useKeyboardNavigation({
    itemCount: drivers.length,
    orientation: "vertical",
    loop: false,
    onLeave: (direction) => {
      if (onNavigateHorizontal) {
        onNavigateHorizontal(direction);
      }
    }
  });

  if (!drivers || drivers.length === 0) return null;

  const podiumDrivers = drivers.slice(0, 3);
  const remainingDrivers = drivers.slice(3, 5);

  const getPodiumStyles = (position: number) => {
    switch (position) {
      case 1:
        return {
          bg: "bg-[var(--color-brand-navy-light)] border-[var(--color-brand-yellow-hover)]",
          text: "text-[var(--color-brand-yellow-hover)]",
          height: "h-40 sm:h-48",
          order: "order-2",
        };
      case 2:
        return {
          bg: "bg-[var(--color-brand-navy-dark)] border-slate-400/40",
          text: "text-slate-300",
          height: "h-32 sm:h-36",
          order: "order-1",
        };
      case 3:
        return {
          bg: "bg-[var(--color-brand-navy-dark)] border-amber-700/40",
          text: "text-amber-600",
          height: "h-24 sm:h-28",
          order: "order-3",
        };
      default:
        return { bg: "", text: "", height: "", order: "" };
    }
  };

  return (
    <section
      className="w-full my-8 bg-[var(--color-brand-navy-dark)]/30 rounded-xl p-4 sm:p-6 border border-[var(--color-brand-navy-light)]/40 focus:outline-none"
      aria-labelledby="leaderboard-heading"
    >
      {/* Nagłówek sekcji */}
      <div className="flex items-center gap-2 mb-6">
        <EmojiEventsIcon className="text-[var(--color-brand-yellow-hover)]" />
        <h2
          id="leaderboard-heading"
          className="text-xl sm:text-2xl font-black uppercase tracking-wide text-[var(--color-brand-text)]"
        >
          Top 5 Kierowców
        </h2>
      </div>

      {/* (Places 1-3) */}
      <div
        className="flex items-end justify-center gap-2 sm:gap-4 max-w-2xl mx-auto mb-6 pt-4 border-b border-[var(--color-brand-navy-light)]/60"
        aria-label="Podium zawodników"
      >
        {podiumDrivers.map((driver) => {
          const styles = getPodiumStyles(driver.position);
          // Obliczamy rzeczywisty indeks w tablicy `drivers`, aby zachować spójność dla hooka
          const driverIndex = drivers.findIndex(d => d.guid === driver.guid);

          return (
            <Link
              key={driver.guid}
              href={`/drivers/${driver.guid}`}
              ref={registerItem(driverIndex)}
              onKeyDown={(e) => handleKeyDown(e, driverIndex)}
              tabIndex={0}
              className={`flex-1 flex flex-col justify-end items-center text-center p-3 rounded-t-lg border-t border-x transition-all duration-200 hover:translate-y-[-4px] hover:bg-[var(--color-brand-navy-light)]/40 focus-brand group ${styles.bg} ${styles.order}`}
              style={{ height: "auto" }}
            >
              <div className="flex flex-col items-center gap-1 mb-3 w-full">
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

              <div className={`w-full flex items-center justify-center font-black text-2xl sm:text-4xl ${styles.text} ${styles.height} bg-[var(--color-brand-navy)]/50 rounded-t-sm border-t border-[var(--color-brand-navy-light)]/20 shadow-inner`}>
                {driver.position}
              </div>
            </Link>
          );
        })}
      </div>

      {/* (Places 4-5) */}
      <div
        className="flex flex-col gap-2 max-w-2xl mx-auto"
        aria-label="Dalsze pozycje w rankingu"
      >
        {remainingDrivers.map((driver) => {
          const driverIndex = drivers.findIndex(d => d.guid === driver.guid);

          return (
            <Link
              key={driver.guid}
              href={`/drivers/${driver.guid}`}
              // REJESTRACJA I OBSŁUGA KLAWIATURY Z HOOKA
              ref={registerItem(driverIndex)}
              onKeyDown={(e) => handleKeyDown(e, driverIndex)}
              tabIndex={0}
              className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-brand-navy-dark)] border border-[var(--color-brand-navy-light)]/60 transition-all focus-brand hover:bg-[var(--color-brand-navy-light)] hover:border-[var(--color-brand-yellow-hover)] group"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono font-black text-sm text-[var(--color-brand-text-muted)] w-4 text-center">
                  {driver.position}
                </span>
                <span className="font-semibold text-sm text-[var(--color-brand-text)] group-hover:text-[var(--color-brand-yellow-hover)]">
                  {driver.mainName}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {driver.combo > 0 && <ComboBadge combo={driver.combo} />}
                <span className="font-mono font-bold text-xs text-[var(--color-brand-yellow-text)] bg-[var(--color-brand-navy)] px-2 py-0.5 rounded border border-[var(--color-brand-navy-light)]">
                  {Math.round(driver.currentElo)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}