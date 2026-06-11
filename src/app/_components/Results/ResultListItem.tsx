"use client";
import React from 'react';
import { TableRow, TableCell, Box, Tooltip } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { RaceResultExtended } from '../../(routes)/events/page';
import ComboBadge from '@/app/_components/Elo/ComboBadge';
import PositionedTableRow from '@/app/_components/Drivers/PositionedTableRow';
import { useRouter } from 'next/navigation';

interface ResultListItemProps {
  row: RaceResultExtended;
}

export default function ResultListItem({ row }: ResultListItemProps) {
  const router = useRouter();

  const handleTableRowClick = () => {
    router.push(`/drivers/${row.guid}`);
  };

  const formatTime = (ms: number) => {
    if (ms === 0 || !ms) return "-";
    const mins = Math.floor(ms / 60000);
    const secs = ((ms % 60000) / 1000).toFixed(3);
    return mins > 0 ? `${mins}:${secs.padStart(6, '0')}` : secs;
  };

  const isGain = row.eloChange >= 0;

  const getPositionStyles = (pos: number) => {
    if (pos === 1) return "!text-brand-yellow font-black bg-brand-yellow/10 dark:bg-brand-yellow/5";
    if (pos === 2) return "!text-race-silver font-bold bg-brand-navy-light/50";
    if (pos === 3) return "!text-race-bronze font-bold bg-race-bronze/10";
    return "!text-brand-muted font-medium";
  };

  return (
    <PositionedTableRow position={row.pos} onClick={handleTableRowClick}>
      <TableCell className="py-4">
        <Box className="flex items-center gap-2">
          {/* Dodano wykrzyknik, aby zbić domyślny kolor z MUI */}
          <span className="font-semibold tracking-wide !text-brand-muted group-hover:!text-brand-yellow transition-colors">
            {row.name}
          </span>
          
          {row.combo > 0 && (
            <ComboBadge combo={row.combo} />
          )}
        </Box>
      </TableCell>
      
      {/* ZMIANA ELO */}
      <TableCell>
        <Box className="flex items-center gap-2 font-mono text-sm">
          {/* Dodano wykrzyknik, aby przebić style MUI */}
          <span className="!text-brand-muted font-medium">{row.eloAfter}</span>
          
          <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-bold border ${
            isGain 
              ? 'bg-elo-gain/10 !text-elo-gain border-elo-gain/20' 
              : 'bg-elo-loss/10 !text-elo-loss border-elo-loss/20'
          }`}>
            {isGain ? `+${row.eloChange}` : row.eloChange}
          </span>
        </Box>
      </TableCell>

      {/* SAMOCHÓD */}
      {/* Dodano wykrzyknik: !text-brand-muted/80 */}
      <TableCell className="!text-brand-muted/80 font-medium text-xs tracking-wide uppercase">
        {row.car}
      </TableCell>

      {/* OKRĄŻENIA */}
      {/* Dodano wykrzyknik: !text-brand-muted */}
      <TableCell className="!text-brand-muted font-mono text-center">
        {row.laps}
      </TableCell>

      {/* CZAS ŁĄCZNY */}
      {/* Dodano wykrzyknik: !text-brand-muted */}
      <TableCell className="!text-brand-muted font-mono font-medium">
        {formatTime(row.totalTime)}
      </TableCell>

      {/* STRATA (GAP) */}
      {/* Dodano wykrzyknik: !text-brand-muted */}
      <TableCell className="!text-brand-muted font-mono text-xs">
        {row.gap === "-" || row.gap === "0.000" || row.pos === 1 ? (
          <span className="!text-brand-yellow font-semibold text-[10px] uppercase tracking-wider bg-brand-yellow/10 px-1.5 py-0.5 rounded border border-brand-yellow/20">
            Winner
          </span>
        ) : (
          `${row.gap}`
        )}
      </TableCell>
    </PositionedTableRow>
  );
}