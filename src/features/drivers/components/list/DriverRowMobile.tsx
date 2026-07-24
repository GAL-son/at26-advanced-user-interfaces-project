"use client";

import React from 'react';
import { useRouter } from 'next/navigation'; 
import { useTranslations, useFormatter } from 'next-intl';
import { motion, Transition } from 'framer-motion';

import ComboBadge from '@/features/ratings/components/ComboBadge';
import PositionTableCell from '@/app/_components/Common/PositionTableCell'; 

import { FormattedDriver, DriverSortOption } from '../../drivers.types';

interface DriverRowMobileProps {
  driver: FormattedDriver;
  index: number;
  sortBy?: DriverSortOption;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>, index: number) => void;
  registerRef: (el: HTMLElement | null) => void;
  transition?: Transition; 
}

export default function DriverRowMobile({ 
  driver, 
  index, 
  sortBy = "RATING_DESC", 
  onKeyDown, 
  registerRef, 
  transition 
}: DriverRowMobileProps) {
  const router = useRouter();
  const t = useTranslations("Drivers");
  const format = useFormatter();

  const handleNavigation = () => {
    router.push(`/drivers/${driver.guid}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleNavigation();
      return;
    }
    onKeyDown(e, index);
  };

  const hasValidDate = Boolean(driver.lastActive);
  const formattedDate = hasValidDate 
    ? format.dateTime(new Date(driver.lastActive!), { year: 'numeric', month: 'long', day: 'numeric' })
    : t("list.notAvailable");

  // Ukrywanie pozycji przy sortowaniu alfabetycznym lub po aktywności
  const isRatingSort = sortBy === "RATING_DESC" || sortBy === "RATING_ASC";
  const isBestRatingSort = sortBy === "BEST_RATING_DESC" || sortBy === "BEST_RATING_ASC";
  const showPosition = isRatingSort || isBestRatingSort;

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
      className="flex items-stretch border-b border-[var(--color-brand-navy-light)] bg-[var(--color-brand-navy-dark)] hover:bg-[color-mix(in_srgb,var(--color-brand-text)_4%,var(--color-brand-navy-dark))] cursor-pointer transition-colors w-full"
    >
      {/* 1. SEKCJA POZYCJI (Warunkowa) */}
      {showPosition && (
        <div role="cell" className="w-12 sm:w-14 flex-shrink-0 flex items-stretch justify-center border-r border-[color-mix(in_srgb,var(--color-brand-navy-light)_40%,transparent)]">
          <PositionTableCell position={driver.position} className="h-full w-full flex items-center justify-center" />
        </div>
      )}

      {/* 2. GŁÓWNA ZAWARTOŚĆ MOBILNA */}
      <div role="cell" className="p-3 sm:p-4 flex-grow min-w-0 flex flex-col gap-2.5">
        
        {/* GÓRNY PANEL: NAZWA KIEROWCY I CURRENT RATING */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-card-title text-[var(--color-brand-text)] group-hover:text-[var(--color-brand-yellow-hover)] transition-colors truncate leading-tight">
                {driver.mainName}
              </span>
              <ComboBadge combo={driver.combo} />
            </div>
            {driver.altNames && driver.altNames !== driver.mainName && (
              <span className="text-xs font-sans text-[var(--color-brand-text-muted)] truncate mt-0.5">
                {t("list.aliases")}: {driver.altNames}
              </span>
            )}
          </div>

          {/* CURRENT RATING / ELO */}
          <div className="text-right flex-shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-wider block text-[var(--color-brand-text-muted)] opacity-60 font-sans">
              {t("list.headers.elo")}
            </span>
            <span className="text-stat-value text-[var(--color-brand-text)] tracking-tight">
              {format.number(Math.round(driver.currentRating || 0))}
            </span>
          </div>
        </div>

        {/* DOLNY PANEL: LAST ACTIVE (LEWA) ORAZ BEST RATING (PRAWA) */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[color-mix(in_srgb,var(--color-brand-navy-light)_50%,transparent)]">
          {/* Po lewej: LAST ACTIVE */}
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-[var(--color-brand-text-muted)] block font-sans">
              {t("list.headers.lastActive")}:
            </span>
            <span className="text-xs font-medium text-[var(--color-brand-text-muted)] font-sans">
              {formattedDate}
            </span>
          </div>

          {/* Po prawej: BEST RATING */}
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[var(--color-brand-text-muted)] block font-sans">
              {t("list.headers.bestRating")}:
            </span>
            <span className="font-mono text-sm font-medium text-[var(--color-brand-text)]">
              {format.number(Math.round(driver.bestRating || 0))}
            </span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}