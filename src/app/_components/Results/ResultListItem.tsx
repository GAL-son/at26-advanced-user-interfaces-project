"use client";
import React from 'react';
import { TableCell, Box } from '@mui/material';
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

  return (
    <PositionedTableRow 
      position={row.pos} 
      onClick={handleTableRowClick}
      sx={{
        // Wiersz ukryty na mobile, widoczny od punktu sm (640px)
        display: { xs: 'none', sm: 'table-row' },
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'color-mix(in srgb, var(--color-brand-text) 3%, var(--color-brand-navy-dark)) !important',
        }
      }}
    >
      {/* NAZWA KIEROWCY */}
      <TableCell className="py-4">
        <Box className="flex items-center gap-2">
          <span 
            className="font-semibold tracking-wide transition-colors duration-200"
            style={{ color: 'var(--color-brand-text-muted)' }}
            sx={{
              '.group:hover &': {
                color: 'var(--color-brand-yellow-hover) !important'
              }
            }}
          >
            {row.name}
          </span>
          {row.combo > 0 && <ComboBadge combo={row.combo} />}
        </Box>
      </TableCell>
      
      {/* ZMIANA ELO */}
      <TableCell>
        <Box className="flex items-center gap-2 font-mono text-sm">
          <span style={{ color: 'var(--color-brand-text)' }}>
            {row.eloAfter}
          </span>
          <Box 
            component="span" 
            className="ml-1 px-1.5 py-0.5 rounded text-xs font-bold border"
            sx={{
              backgroundColor: isGain 
                ? 'color-mix(in srgb, var(--color-elo-gain) 10%, transparent)' 
                : 'color-mix(in srgb, var(--color-elo-loss) 10%, transparent)',
              color: isGain ? 'var(--color-elo-gain)' : 'var(--color-elo-loss)',
              borderColor: isGain 
                ? 'color-mix(in srgb, var(--color-elo-gain) 20%, transparent)' 
                : 'color-mix(in srgb, var(--color-elo-loss) 20%, transparent)',
            }}
          >
            {isGain ? `+${row.eloChange}` : row.eloChange}
          </Box>
        </Box>
      </TableCell>

      {/* SAMOCHÓD */}
      <TableCell 
        className="font-medium text-xs tracking-wide uppercase"
        style={{ color: 'var(--color-brand-text-muted)' }}
      >
        {row.car}
      </TableCell>

      {/* OKRĄŻENIA (Tablet hide, Desktop show) */}
      <TableCell 
        className="font-mono text-center hidden md:table-cell"
        style={{ color: 'var(--color-brand-text-muted)' }}
      >
        {row.laps}
      </TableCell>

      {/* CZAS ŁĄCZNY */}
      <TableCell 
        className="font-mono font-medium"
        style={{ color: 'var(--color-brand-text)' }}
      >
        {formatTime(row.totalTime)}
      </TableCell>

      {/* STRATA (GAP) / WINNER */}
      <TableCell className="font-mono text-xs">
        {row.gap === "-" || row.gap === "0.000" || row.pos === 1 ? (
          <Box 
            component="span"
            className="font-semibold text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border"
            sx={{
              color: 'var(--color-brand-yellow-text)',
              backgroundColor: 'color-mix(in srgb, var(--color-brand-yellow) 12%, transparent)',
              borderColor: 'color-mix(in srgb, var(--color-brand-yellow) 20%, transparent)',
            }}
          >
            Winner
          </Box>
        ) : (
          <span style={{ color: 'var(--color-brand-text-muted)' }}>
            {row.gap}
          </span>
        )}
      </TableCell>
    </PositionedTableRow>
  );
}