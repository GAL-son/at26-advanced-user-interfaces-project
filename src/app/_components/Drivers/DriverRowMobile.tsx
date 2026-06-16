"use client";

import React from 'react';
import { TableCell, Box } from '@mui/material';
import ComboBadge from '@/app/_components/Elo/ComboBadge';
import PositionedTableRow from '@/app/_components/Drivers/PositionedTableRow';
import PositionTableCell from '@/app/_components/Common/PositionTableCell'; // Import naszej nowej komórki podium
import { useRouter } from 'next/navigation'; 
import { FormattedDriver } from './DriverRow';
import { useTranslations, useFormatter } from 'next-intl';

interface DriverRowMobileProps {
  driver: FormattedDriver;
}

export default function DriverRowMobile({ driver }: DriverRowMobileProps) {
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
    }
  };

  const hasValidDate = driver.lastRaced && driver.lastRaced !== "N/A";
  const formattedDate = hasValidDate 
    ? format.dateTime(new Date(driver.lastRaced!), { year: 'numeric', month: 'long', day: 'numeric' })
    : t("list.notAvailable");

  return (
    <PositionedTableRow 
      onClick={handleNavigation}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="link"
      aria-label={t("list.rowAriaLabel", { name: driver.mainName })}
      className="group cursor-pointer"
      sx={{
        outline: 'none',
        // Zunifikowany focus-ring w sx dla MUI
        '&:focus-visible': {
          backgroundColor: 'color-mix(in srgb, var(--color-brand-text) 6%, var(--color-brand-navy-dark)) !important',
          outline: '2px solid var(--color-brand-yellow-hover)',
          outlineOffset: '-2px',
          position: 'relative',
          zIndex: 10
        }
      }}
    >
      {/* JAWNA I WSPÓŁDZIELONA KOMÓRKA POZYCJI DLA WERSJI MOBILNEJ */}
      <PositionTableCell 
        position={driver.position} 
        className="!p-2" // Lekkie zmniejszenie paddingu na mobile, by dopasować wysokość
      />

      {/* DANE KIEROWCY (Zmniejszamy colSpan z 4 na 3, zwalniając miejsce dla pozycji) */}
      <TableCell colSpan={3} className="p-4 border-b border-[var(--color-brand-navy-light)]">
        <Box className="flex flex-col gap-3">
          
          {/* GÓRNY WIERSZ: Nazwa i ELO */}
          <Box className="flex items-start justify-between gap-2">
            <Box className="flex items-center gap-2 min-w-0">
              <Box className="flex flex-col min-w-0">
                <Box className="flex items-center gap-2">
                  <span className="font-bold text-base text-[var(--color-brand-text)] group-hover:text-[var(--color-brand-yellow-hover)] transition-colors truncate">
                    {driver.mainName}
                  </span>
                  <ComboBadge combo={driver.combo} />
                </Box>
                {driver.altNames && driver.altNames !== driver.mainName && (
                  <span className="text-xs text-[var(--color-brand-text-muted)] truncate mt-0.5">
                    {t("list.aliases")}: {driver.altNames}
                  </span>
                )}
              </Box>
            </Box>

            {/* Punkty ELO */}
            <Box className="text-right flex-shrink-0">
              <span className="text-xs uppercase font-bold tracking-wider block text-[var(--color-brand-text-muted)] opacity-60 text-[9px]">
                {t("list.headers.elo")}
              </span>
              <span className="font-mono font-black text-base text-[var(--color-brand-yellow-text)]">
                {format.number(Math.round(driver.currentElo || 0))}
              </span>
            </Box>
          </Box>

          {/* DOLNY WIERSZ: Szybkie Statystyki */}
          <Box className="grid grid-cols-2 gap-2 pt-2 border-t border-[color-mix(in srgb,var(--color-brand-navy-light)_50%,transparent)] text-xs">
            <Box>
              <span className="text-[10px] uppercase font-bold text-[var(--color-brand-text-muted)] block">
                {t("list.headers.races")}:
              </span>
              <span className="font-mono font-medium text-[var(--color-brand-text)]">
                {format.number(driver.racesCount)}
              </span>
            </Box>
            <Box className="text-right">
              <span className="text-[10px] uppercase font-bold text-[var(--color-brand-text-muted)] block">
                {t("list.headers.lastActive")}:
              </span>
              <span className="font-medium text-[var(--color-brand-text-muted)]">
                {formattedDate}
              </span>
            </Box>
          </Box>

        </Box>
      </TableCell>
    </PositionedTableRow>
  );
}