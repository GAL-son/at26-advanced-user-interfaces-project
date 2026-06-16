"use client";

import React from 'react';
import { TableCell, Box } from '@mui/material';
import ComboBadge from '@/app/_components/Elo/ComboBadge';
import PositionedTableRow from '@/app/_components/Drivers/PositionedTableRow';
import PositionTableCell from '@/app/_components/Common/PositionTableCell'; 
import { useRouter } from 'next/navigation'; 
import { FormattedDriver } from './DriverRow';
import { useTranslations, useFormatter } from 'next-intl';

interface DriverRowMobileProps {
  driver: FormattedDriver;
  index: number;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>, index: number) => void;
  registerRef: (el: HTMLElement | null) => void;
}

export default function DriverRowMobile({ driver, index, onKeyDown, registerRef }: DriverRowMobileProps) {
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
      {/* Pozycja na podium - dedykowany i zunifikowany komponent */}
      <PositionTableCell position={driver.position} className="!p-2" />

      <TableCell colSpan={3} className="p-4 border-b border-[var(--color-brand-navy-light)]">
        <Box className="flex flex-col gap-3">
          <Box className="flex items-start justify-between gap-2">
            <Box className="flex items-center gap-2 min-w-0">
              <Box className="flex flex-col min-w-0">
                <Box className="flex items-center gap-2">
                  {/* POPRAWKA: Wpięcie !text-card-title dla ujednolicenia czcionki kierowcy */}
                  <span className="!text-card-title !text-brand-text group-hover:!text-brand-yellow-hover transition-colors truncate leading-tight">
                    {driver.mainName}
                  </span>
                  <ComboBadge combo={driver.combo} />
                </Box>
                {driver.altNames && driver.altNames !== driver.mainName && (
                  <span className="text-xs !font-sans !text-brand-text-muted truncate mt-0.5">
                    {t("list.aliases")}: {driver.altNames}
                  </span>
                )}
              </Box>
            </Box>

            {/* SEKCJA RATINGU ELO */}
            <Box className="text-right flex-shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider block !text-brand-text-muted opacity-60 !font-sans">
                {t("list.headers.elo")}
              </span>
              {/* POPRAWKA: Przejście z text-base na wyścigowy, duży token !text-stat-value */}
              <span className="!text-stat-value !text-brand-text tracking-tight">
                {format.number(Math.round(driver.currentElo || 0))}
              </span>
            </Box>
          </Box>

          {/* DOLNA PANEL STATYSTYK */}
          <Box className="grid grid-cols-2 gap-2 pt-2 border-t border-[color-mix(in srgb,var(--color-brand-navy-light)_50%,transparent)]">
            <Box>
              <span className="text-[10px] uppercase font-bold !text-brand-text-muted block !font-sans">
                {t("list.headers.races")}:
              </span>
              {/* POPRAWKA: Wymuszenie czytelnego !text-btn-mono lub czystego mono dla liczb */}
              <span className="!font-mono text-sm font-medium !text-brand-text">
                {format.number(driver.racesCount)}
              </span>
            </Box>
            <Box className="text-right">
              <span className="text-[10px] uppercase font-bold !text-brand-text-muted block !font-sans">
                {t("list.headers.lastActive")}:
              </span>
              {/* POPRAWKA: Wymuszenie !font-sans i ujednolicenie rozmiaru tekstu daty */}
              <span className="text-xs font-medium !text-brand-text-muted !font-sans">
                {formattedDate}
              </span>
            </Box>
          </Box>
        </Box>
      </TableCell>
    </PositionedTableRow>
  );
}