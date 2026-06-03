"use client";
import React from 'react';
import { TableRow, TableCell } from '@mui/material';
import ComboBadge from '../../_components/ComboBadge';

export interface FormattedDriver {
  guid: string;
  mainName: string;
  altNames: string | null;
  currentElo: number;
  combo: number;
  racesCount: number;
  lastRaced: string | null;
  position: number; // Dodany atrybut pozycji
}

interface DriverRowProps {
  driver: FormattedDriver;
  index: number;
}

function formatLastRaced(dateString: string | null): string {
  if (!dateString) return 'No races recorded';
  const date = new Date(dateString);
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
    <TableRow 
      sx={{ 
        '&:hover': { 
          backgroundColor: 'var(--color-brand-navy-light) !important' 
        },
        transition: 'background-color 0.15s ease',
      }}
      className="group bg-brand-navy-dark border-b border-brand-navy-light h-[64px]" // ZMIANA: Sztywna wysokość dla całego wiersza
    >
      {/* POSITION */}
      <TableCell align="center" className="!text-brand-muted/60 !font-bold font-mono">
        {driver.position}
      </TableCell>

      {/* DRIVER INFO */}
      <TableCell className="py-0 h-full">
        {/* Kontener zajmuje pełną wysokość i centruje zawartość w pionie */}
        <div className="flex flex-col justify-center h-[48px] max-w-md">
          <div className="flex items-center gap-2">
            <span className="font-semibold !text-brand-muted group-hover:!text-brand-yellow transition-colors text-base leading-tight">
              {driver.mainName}
            </span>
            <ComboBadge combo={driver.combo} />
          </div>
          
          {/* Warunkowy render: jeśli jest alias, dodaje go poniżej; jeśli nie ma, flexbox idealnie wycentruje samą nazwę */}
          {driver.altNames && (
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
        {driver.currentElo.toFixed(1)}
      </TableCell>
    </TableRow>
  );
}