"use client";
import React from 'react';
import { TableCell } from '@mui/material';
import ComboBadge from '@/app/_components/Elo/ComboBadge';
import PositionedTableRow from '@/app/_components/Drivers/PositionedTableRow';
import { useRouter } from 'next/navigation'; 

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
  usePosition: boolean;
}

function formatLastRaced(dateString: string | null): string {
  if (!dateString || dateString === "N/A") return 'No races recorded';
  const date = new Date(dateString);
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

export default function DriverRow({ driver, usePosition = true}: DriverRowProps) {
  const router = useRouter();

  const handleTableRowClick = () => {
    router.push(`/drivers/${driver.guid}`);
  };

  return (
    <PositionedTableRow 
      position={driver.position} 
      onClick={handleTableRowClick}
      /* POPRAWKA: Zamiana hover:bg-white/5 na delikatny, uniwersalny hover oparty o navy-light */
      className="cursor-pointer hover:bg-brand-navy-light/30 transition-colors group"
    >
        <TableCell className="py-0 h-full">
          <div className="flex flex-col justify-center h-[48px] max-w-md">
            <div className="flex items-center gap-2">
              {/* POPRAWKA: Główny tekst na bazie brand-text, a hover dynamicznie reaguje na brand-yellow */}
              <span className="font-semibold !text-brand-text group-hover:!text-brand-yellow-hover transition-colors text-base leading-tight">
                {driver.mainName}
              </span>
              <ComboBadge combo={driver.combo} />
            </div>

            {driver.altNames && driver.altNames !== driver.mainName && (
              /* POPRAWKA: Zamiana !text-brand-muted/60 na semantyczny text-brand-text-muted */
              <div className="text-xs !text-brand-text-muted mt-0.5 truncate leading-none">
                Aliases: {driver.altNames}
              </div>
            )}
          </div>
        </TableCell>

        {/* RACES COUNT */}
        {/* POPRAWKA: Zamiana !text-brand-muted na !text-brand-text */}
        <TableCell align="center" className="!text-brand-text font-mono font-medium">
          {driver.racesCount}
        </TableCell>

        {/* LAST ACTIVE */}
        {/* POPRAWKA: Zastąpienie przezroczystości przez !text-brand-text-muted */}
        <TableCell align="center" className="!text-brand-text-muted text-sm font-medium">
          {formatLastRaced(driver.lastRaced)}
        </TableCell>

        {/* ELO RATING */}
        {/* UWAGA: Jeśli to ogólny widok rankingu, elo-gain jest ok, ale jeśli tekst ma być po prostu czytelny na jasnym tle, upewnij się, że zielony z palety spełnia normy WCAG. W razie problemów zmień na !text-brand-text */}
        <TableCell align="right" className="!text-elo-gain font-mono font-bold text-lg">
          {typeof driver.currentElo === 'number' ? driver.currentElo.toFixed(0) : '0'}
        </TableCell>
      </PositionedTableRow>
  );
}