"use client";
import React from 'react';
import { TableCell, Box } from '@mui/material';
import ComboBadge from '@/app/_components/Elo/ComboBadge';
import PositionedTableRow from '@/app/_components/Drivers/PositionedTableRow';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import PositionTableCell from '../Common/PositionTableCell';

interface RaceResultExtended {
  guid: string;
  pos: number;
  name: string;
  car: string;
  laps: number;
  totalTime: number;
  bestLap: number;
  gap: string;
  eloBefore: number;
  eloAfter: number;
  eloChange: number;
  combo: number;
}

interface ResultListItemProps {
  row: RaceResultExtended;
}

export default function ResultListItem({ row }: ResultListItemProps) {
  const t = useTranslations("Results.table");
  const router = useRouter();

  const handleNavigation = () => {
    router.push(`/drivers/${row.guid}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavigation();
    }
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
      onClick={handleNavigation}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="link"
      aria-label={`${row.pos}. ${row.name}, ${t("goToProfile")}`}
      sx={{ display: { xs: 'none', md: 'table-row' }, cursor: 'pointer', outline: 'none' }}
    >
      {/* JAWNE I REUŻYWALNE WSTRZYKNIĘCIE KOMÓRKI POZYCJI */}
      <PositionTableCell position={row.pos} />

      {/* REZTA TWOICH KOMÓREK BEZ ZMIAN */}
      <TableCell className="py-4">
        <Box className="flex items-center gap-2">
          <span style={{ color: 'var(--color-brand-text-muted)' }}>{row.name}</span>
          {row.combo > 0 && <ComboBadge combo={row.combo} />}
        </Box>
      </TableCell>
      
      {/* COL 3: ZMIANA ELO */}
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

      {/* COL 4: SAMOCHÓD */}
      <TableCell 
        className="font-medium text-xs tracking-wide uppercase"
        style={{ color: 'var(--color-brand-text-muted)' }}
      >
        {row.car}
      </TableCell>

      {/* COL 5: OKRĄŻENIA */}
      <TableCell 
        className="font-mono text-center hidden md:table-cell"
        style={{ color: 'var(--color-brand-text-muted)' }}
      >
        {row.laps}
      </TableCell>

      {/* COL 6: CZAS ŁĄCZNY */}
      <TableCell 
        className="font-mono font-medium"
        style={{ color: 'var(--color-brand-text)' }}
      >
        {formatTime(row.totalTime)}
      </TableCell>

      {/* COL 7: STRATA (GAP) / WINNER */}
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
            {t("winner")}
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