"use client";

import React from 'react';
import { TableCell } from '@mui/material';
import ComboBadge from '@/app/_components/Elo/ComboBadge';
import PositionedTableRow from '@/app/_components/Drivers/PositionedTableRow';
import PositionTableCell from '@/app/_components/Common/PositionTableCell'; 
import { useRouter } from 'next/navigation'; 
import { useTranslations, useFormatter } from 'next-intl';
import { Transition } from 'framer-motion';

export interface FormattedDriver {
  guid: string;
  mainName: string;
  altNames: string | null;
  currentElo: number;
  combo: number;
  racesCount: number;
  lastRaced: string | null;
  position: number;
}

interface DriverRowProps {
  driver: FormattedDriver;
  index: number;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>, index: number) => void;
  registerRef: (el: HTMLElement | null) => void;
  transition?: Transition;
}

export default function DriverRow({ driver, index, onKeyDown, registerRef, transition}: DriverRowProps) {
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

  const hasValidDate = driver.lastRaced && driver.lastRaced !== "N/A";
  const formattedDate = hasValidDate 
    ? format.dateTime(new Date(driver.lastRaced!), { year: 'numeric', month: 'long', day: 'numeric' })
    : t("list.notAvailable");

  return (
    <PositionedTableRow
      ref={registerRef}
      transition={transition} // ← nowe, reszta props bez zmian
      onClick={handleNavigation}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="link"
      aria-label={t("list.rowAriaLabel", { name: driver.mainName })}
      className="group cursor-pointer focus-brand"
      sx={{
        outline: 'none',
        '&:focus-visible': {
          backgroundColor: 'color-mix(in srgb, var(--color-brand-text) 6%, var(--color-brand-navy-dark)) !important',
          position: 'relative',
          zIndex: 10
        }
      }}
    >
      {/* Komórka pozycji (już zoptymalizowana pod !text-stat-value) */}
      <PositionTableCell position={driver.position} />

      {/* Nazwa kierowcy oraz aliasy */}
      <TableCell className="py-0 h-full">
        <div className="flex flex-col justify-center h-[48px] max-w-md">
          <div className="flex items-center gap-2">
            {/* Zmiana: Wykorzystanie tokenu !text-card-title dla Orbitrona/Rajdhani z uppercase */}
            <span className="!text-card-title !text-brand-text group-hover:!text-brand-yellow-hover transition-colors leading-tight">
              {driver.mainName}
            </span>
            <ComboBadge combo={driver.combo} />
          </div>
          {driver.altNames && driver.altNames !== driver.mainName && (
            <div className="text-xs !font-sans !text-brand-text-muted mt-0.5 truncate leading-none">
              {t("list.aliases")}: {driver.altNames}
            </div>
          )}
        </div>
      </TableCell>

      {/* Liczba wyścigów */}
      {/* Zmiana: Wyciągnięcie czcionki mono, ale z lepszym pozycjonowaniem rozmiaru (sm na mobile, base na desktoie) */}
      <TableCell align="center" className="!text-brand-text !font-mono text-sm sm:text-base font-medium">
        <span className="sr-only">{t("list.headers.races")}: </span>
        {format.number(driver.racesCount)}
      </TableCell>

      {/* Data ostatniej aktywności */}
      {/* Zmiana: Dynamiczny rozmiar tekstu text-xs do text-sm z zabezpieczeniem !font-sans */}
      <TableCell align="center" className="!text-brand-text-muted text-xs sm:text-sm font-medium !font-sans">
        <span className="sr-only">{t("list.headers.lastActive")}: </span>
        {formattedDate}
      </TableCell>

      {/* Punkty ELO */}
      {/* Zmiana: Kolor zmieniony na neutralny dla rankingu bazowego + dynamiczny token !text-stat-value */}
      <TableCell align="right" className="!text-brand-text !text-stat-value tracking-tight">
        <span className="sr-only">{t("list.headers.elo")}: </span>
        {format.number(Math.round(driver.currentElo || 0))}
      </TableCell>
    </PositionedTableRow>
  );
}