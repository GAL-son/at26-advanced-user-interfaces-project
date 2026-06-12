"use client";

import React from 'react';
import { TableCell } from '@mui/material';
import ComboBadge from '@/app/_components/Elo/ComboBadge';
import PositionedTableRow from '@/app/_components/Drivers/PositionedTableRow';
import { useRouter } from 'next/navigation'; 
import { formatLastRaced } from '@/app/_utils/dateHelpers'; // Możesz też zostawić funkcję lokalnie

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
}

export default function DriverRow({ driver }: DriverRowProps) {
  const router = useRouter();

  return (
    <PositionedTableRow 
      position={driver.position} 
      onClick={() => router.push(`/drivers/${driver.guid}`)}
      className="cursor-pointer hover:bg-brand-navy-light/30 transition-colors group"
    >
      {/* PROFIL KIEROWCY */}
      <TableCell className="py-0 h-full">
        <div className="flex flex-col justify-center h-[48px] max-w-md">
          <div className="flex items-center gap-2">
            <span className="font-semibold !text-brand-text group-hover:!text-brand-yellow-hover transition-colors text-base leading-tight">
              {driver.mainName}
            </span>
            <ComboBadge combo={driver.combo} />
          </div>

          {driver.altNames && driver.altNames !== driver.mainName && (
            <div className="text-xs !text-brand-text-muted mt-0.5 truncate leading-none">
              Aliases: {driver.altNames}
            </div>
          )}
        </div>
      </TableCell>

      {/* STATYSTYKI */}
      <TableCell align="center" className="!text-brand-text font-mono font-medium">
        {driver.racesCount}
      </TableCell>

      <TableCell align="center" className="!text-brand-text-muted text-sm font-medium">
        {formatLastRaced(driver.lastRaced)}
      </TableCell>

      <TableCell align="right" className="!text-elo-gain font-mono font-bold text-lg">
        {typeof driver.currentElo === 'number' ? driver.currentElo.toFixed(0) : '0'}
      </TableCell>
    </PositionedTableRow>
  );
}