"use client";

import React from 'react';
import { TableCell, Box } from '@mui/material';
import ComboBadge from '@/app/_components/Elo/ComboBadge';
import PositionedTableRow from '@/app/_components/Drivers/PositionedTableRow';
import { useRouter } from 'next/navigation'; 
import { FormattedDriver } from './DriverRow';
import { formatLastRaced } from '@/app/_utils/dateHelpers';

interface DriverRowMobileProps {
  driver: FormattedDriver;
}

export default function DriverRowMobile({ driver }: DriverRowMobileProps) {
  const router = useRouter();

  return (
    <PositionedTableRow 
      position={driver.position} 
      onClick={() => router.push(`/drivers/${driver.guid}`)}
      className="cursor-pointer hover:bg-brand-navy-light/20 transition-colors group"
    >
      <TableCell colSpan={5} className="p-4 border-b border-[var(--color-brand-navy-light)]">
        <Box className="flex flex-col gap-3">
          
          {/* GÓRNY WIERSZ: Pozycja, Nazwa i ELO */}
          <Box className="flex items-start justify-between gap-2">
            <Box className="flex items-center gap-2 min-w-0">
              {/* Nazwa i Badge */}
              <Box className="flex flex-col min-w-0">
                <Box className="flex items-center gap-2">
                  <span className="font-bold text-base text-[var(--color-brand-text)] group-hover:text-[var(--color-brand-yellow-hover)] transition-colors truncate">
                    {driver.mainName}
                  </span>
                  <ComboBadge combo={driver.combo} />
                </Box>
                {driver.altNames && driver.altNames !== driver.mainName && (
                  <span className="text-xs text-[var(--color-brand-text-muted)] truncate mt-0.5">
                    {driver.altNames}
                  </span>
                )}
              </Box>
            </Box>

            {/* Punkty ELO (wyróżnione z prawej strony) */}
            <Box className="text-right flex-shrink-0">
              <span className="text-xs uppercase font-bold tracking-wider block text-[var(--color-brand-text-muted)] opacity-60 text-[9px]">
                ELO
              </span>
              <span className="font-mono font-black text-base text-[var(--color-brand-yellow-text)]">
                {typeof driver.currentElo === 'number' ? driver.currentElo.toFixed(0) : '0'}
              </span>
            </Box>
          </Box>

          {/* DOLNY WIERSZ: Szybkie Statystyki (Siatka pozioma) */}
          <Box className="grid grid-cols-2 gap-2 pt-2 border-t border-[color-mix(in srgb,var(--color-brand-navy-light)_50%,transparent)] text-xs">
            <Box>
              <span className="text-[10px] uppercase font-bold text-[var(--color-brand-text-muted)] block">
                Races Started:
              </span>
              <span className="font-mono font-medium text-[var(--color-brand-text)]">
                {driver.racesCount}
              </span>
            </Box>
            <Box className="text-right">
              <span className="text-[10px] uppercase font-bold text-[var(--color-brand-text-muted)] block">
                Last Active:
              </span>
              <span className="font-medium text-[var(--color-brand-text-muted)]">
                {formatLastRaced(driver.lastRaced)}
              </span>
            </Box>
          </Box>

        </Box>
      </TableCell>
    </PositionedTableRow>
  );
}