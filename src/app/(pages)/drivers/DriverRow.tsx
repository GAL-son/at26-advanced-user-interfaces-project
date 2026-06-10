"use client";
import React from 'react';
import { TableRow, TableCell } from '@mui/material';
import ComboBadge from '../../_components/ComboBadge';
import PositionedListItem from '../../_components/PositionedListItem'; // Zaimportuj PositionedListItem

// Ujednolicony interfejs - dokładnie taki, jaki leci z API i z mapowania
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
  // Usunęliśmy nieużywany 'index', bo pozycja jest już w obiekcie driver
}

function formatLastRaced(dateString: string | null): string {
  if (!dateString || dateString === "N/A") return 'No races recorded';
  const date = new Date(dateString);
  // Sprawdzenie poprawności daty
  if (isNaN(date.getTime())) return 'No races recorded';

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export default function DriverRow({ driver }: DriverRowProps) {
  return (
    <PositionedListItem position={driver.position}>

      {/* DRIVER INFO */}
      <TableCell className="py-0 h-full">
        <div className="flex flex-col justify-center h-[48px] max-w-md">
          <div className="flex items-center gap-2">
            <span className="font-semibold !text-brand-muted group-hover:!text-brand-yellow transition-colors text-base leading-tight">
              {driver.mainName}
            </span>
            <ComboBadge combo={driver.combo} />
          </div>

          {driver.altNames && driver.altNames !== driver.mainName && (
            <div className="text-xs !text-brand-muted/60 mt-0.5 truncate leading-none">
              Aliases: {driver.altNames}
            </div>
          )}
        </div>
      </TableCell>

      {/* RACES COUNT */}
      <TableCell align="center" className="!text-brand-muted font-mono font-medium">
        {driver.racesCount}
      </TableCell>

      {/* LAST ACTIVE */}
      <TableCell align="center" className="!text-brand-muted/80 text-sm font-medium">
        {formatLastRaced(driver.lastRaced)}
      </TableCell>

      {/* ELO RATING */}
      <TableCell align="right" className="!text-elo-gain font-mono font-bold text-lg">
        {typeof driver.currentElo === 'number' ? driver.currentElo.toFixed(0) : '0'}
      </TableCell>
    </PositionedListItem>
  );
}