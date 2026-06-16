"use client";

import React from 'react';
import { TableCell } from '@mui/material';
import ComboBadge from '@/app/_components/Elo/ComboBadge';
import PositionedTableRow from '@/app/_components/Drivers/PositionedTableRow';
import PositionTableCell from '@/app/_components/Common/PositionTableCell'; 
import { useRouter } from 'next/navigation'; 
import { useTranslations, useFormatter } from 'next-intl';

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
}

export default function DriverRow({ driver, index, onKeyDown, registerRef }: DriverRowProps) {
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
      onClick={handleNavigation}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="link"
      aria-label={t("list.rowAriaLabel", { name: driver.mainName })}
      /* Wykorzystanie zarejestrowanej klasy focusu z globals.css */
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
      <PositionTableCell position={driver.position} />

      <TableCell className="py-0 h-full">
        <div className="flex flex-col justify-center h-[48px] max-w-md">
          <div className="flex items-center gap-2">
            {/* Wymuszenie czcionki podstawowej !font-sans dla zachowania Rajdhani wewnątrz MUI */}
            <span className="font-semibold !font-sans !text-brand-text group-hover:!text-brand-yellow-hover transition-colors text-base leading-tight">
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

      {/* Wykorzystanie tokenu liczbowego !text-btn-mono, który zawiera Share Tech Mono */}
      <TableCell align="center" className="!text-brand-text !text-btn-mono">
        <span className="sr-only">{t("list.headers.races")}: </span>
        {format.number(driver.racesCount)}
      </TableCell>

      <TableCell align="center" className="!text-brand-text-muted text-sm font-medium !font-sans">
        <span className="sr-only">{t("list.headers.lastActive")}: </span>
        {formattedDate}
      </TableCell>

      {/* Licznik punktacji ELO z przypisaniem dużego tokenu telemetrycznego !text-stat-value */}
      <TableCell align="right" className="!text-elo-gain !text-stat-value">
        <span className="sr-only">{t("list.headers.elo")}: </span>
        {format.number(Math.round(driver.currentElo || 0))}
      </TableCell>
    </PositionedTableRow>
  );
}