"use client";

import React from 'react';
import { useRouter } from 'next/navigation'; 
import { useTranslations, useFormatter } from 'next-intl';
import { motion, Transition } from 'framer-motion';

import ComboBadge from '@/features/ratings/components/ComboBadge';
import PositionTableCell from '@/app/_components/Common/PositionTableCell'; 

import type { FormattedDriver, DriverSortOption } from "../../drivers.types";

interface DriverRowProps {
  driver: FormattedDriver;
  index: number;
  sortBy?: DriverSortOption;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>, index: number) => void;
  registerRef: (el: HTMLElement | null) => void;
  transition?: Transition;
}

export default function DriverRow({ 
  driver, 
  index, 
  sortBy = "RATING_DESC", 
  onKeyDown, 
  registerRef, 
  transition 
}: DriverRowProps) {
  const router = useRouter();
  const t = useTranslations("Drivers");
  const format = useFormatter();

  const handleNavigation = () => router.push(`/drivers/${driver.guid}`);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleNavigation();
      return;
    }
    onKeyDown(e, index);
  };

  const formattedDate = driver.lastActive 
    ? format.dateTime(new Date(driver.lastActive), { year: 'numeric', month: 'long', day: 'numeric' })
    : t("list.notAvailable");

  // Flagi trybu sortowania
  const isRatingSort = sortBy === "RATING_DESC" || sortBy === "RATING_ASC";
  const isBestRatingSort = sortBy === "BEST_RATING_DESC" || sortBy === "BEST_RATING_ASC";
  const isFullColumns = !isRatingSort && !isBestRatingSort; // NAME_* lub LAST_ACTIVE_*

  // Pokazujemy pozycję tylko przy sortowaniu po rankingu lub najlepszym rankingu
  const showPosition = isRatingSort || isBestRatingSort;

  // Układ grida: z pozycją (4 kolumny) vs bez pozycji (4 kolumny o innych szerokościach)
  const gridLayoutClass = showPosition 
    ? "grid-cols-[64px_1fr_176px_144px]" 
    : "grid-cols-[1fr_144px_176px_144px]";

  return (
    <motion.div
      ref={registerRef as any}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={transition ?? { duration: 0.2 }}
      onClick={handleNavigation}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="row"
      aria-label={t("list.rowAriaLabel", { name: driver.mainName })}
      className={`grid ${gridLayoutClass} items-stretch border-b border-[var(--color-brand-navy-light)] bg-[var(--color-brand-navy-dark)] hover:bg-[color-mix(in_srgb,var(--color-brand-text)_4%,var(--color-brand-navy-dark))] cursor-pointer transition-colors`}
    >
      {/* 1. POS (Tylko gdy sortujemy po RATING lub BEST_RATING) */}
      {showPosition && (
        <div role="cell" className="flex items-center justify-center h-full w-full font-bold">
          <PositionTableCell position={driver.position} className="h-full w-full flex items-center justify-center" />
        </div>
      )}

      {/* 2. PROFILE (Zawsze) */}
      <div role="cell" className="flex flex-col justify-center min-h-[48px] max-w-md py-2 px-4">
        <div className="flex items-center gap-2">
          <span className="text-card-title text-[var(--color-brand-text)] group-hover:text-[var(--color-brand-yellow-hover)] leading-tight">
            {driver.mainName}
          </span>
          <ComboBadge combo={driver.combo} erosion={driver.erosion}/>
        </div>
        {driver.altNames && driver.altNames !== driver.mainName && (
          <div className="text-xs text-[var(--color-brand-text-muted)] mt-0.5 truncate leading-none">
            {t("list.aliases")}: {driver.altNames}
          </div>
        )}
      </div>

      {/* 3. BEST RATING (Pojawia się przy BEST_RATING, NAME oraz LAST_ACTIVE) */}
      {(isBestRatingSort || isFullColumns) && (
        <div role="cell" className="flex items-center justify-center py-2 px-4 text-center font-mono text-sm sm:text-base font-medium text-[var(--color-brand-text)]">
          {format.number(Math.round(driver.bestRating || 0))}
        </div>
      )}

      {/* 4. LAST ACTIVE (Zawsze) */}
      <div role="cell" className="flex items-center justify-center py-2 px-4 text-center text-xs sm:text-sm font-medium text-[var(--color-brand-text-muted)]">
        {formattedDate}
      </div>

      {/* 5. CURRENT RATING / ELO (Pojawia się przy RATING, NAME oraz LAST_ACTIVE) */}
      {(isRatingSort || isFullColumns) && (
        <div role="cell" className="flex items-center justify-center py-2 px-4 text-right text-[var(--color-brand-text)] text-stat-value tracking-tight">
          {format.number(Math.round(driver.currentRating || 0))}
        </div>
      )}
    </motion.div>
  );
}