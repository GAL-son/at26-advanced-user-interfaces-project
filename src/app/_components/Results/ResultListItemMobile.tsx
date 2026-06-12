"use client";
import React from 'react';
import { TableCell, Box, Typography } from '@mui/material';
import { RaceResultExtended } from '../../(routes)/events/page';
import ComboBadge from '@/app/_components/Elo/ComboBadge';
import PositionedTableRow from '@/app/_components/Drivers/PositionedTableRow';
import { useRouter } from 'next/navigation';

interface ResultListItemMobileProps {
  row: RaceResultExtended;
}

export default function ResultListItemMobile({ row }: ResultListItemMobileProps) {
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
        // Wiersz widoczny TYLKO na mobile (poniżej sm)
        display: { xs: 'table-row', sm: 'none' },
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'color-mix(in srgb, var(--color-brand-text) 3%, var(--color-brand-navy-dark)) !important',
        }
      }}
    >
      {/* colSpan={6} wypełnia całą przestrzeń obok komórki pozycji z PositionedTableRow */}
      <TableCell
        colSpan={6}
        sx={{
          p: 2,
          borderBottom: '1px solid var(--color-brand-navy-light)',
          width: '100%',
        }}
      >
        <Box className="flex flex-col gap-1.5 w-full">
          {/* GÓRNA LINIA: Nazwa gracza + Combo oraz Wynik ELO (Największe) */}
          <Box className="flex justify-between items-center w-full gap-4">
            <Box className="flex items-center gap-2 min-w-0">
              <Typography 
                variant="body1"
                className="font-bold tracking-wide truncate text-base"
                sx={{ 
                  color: 'var(--color-brand-text)',
                  '.MuiTableRow-root:hover &': {
                    color: 'var(--color-brand-yellow-hover) !important'
                  }
                }}
              >
                {row.name}
              </Typography>
              {row.combo > 0 && (
                <Box className="flex-shrink-0 scale-90 origin-left">
                  <ComboBadge combo={row.combo} />
                </Box>
              )}
            </Box>
            
            {/* ELO i zmiana */}
            <Box className="flex items-center gap-1.5 font-mono text-sm font-semibold flex-shrink-0">
              <span style={{ color: 'var(--color-brand-text)' }}>{row.eloAfter}</span>
              <Box 
                component="span" 
                className="px-1.5 py-0.5 rounded text-xs font-bold border"
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
          </Box>

          {/* DOLNA LINIA: Samochód, Laps, Czas i Gap (Mniejsze, stonowane) */}
          <Box className="flex justify-between items-center w-full text-xs font-medium">
            <Typography 
              variant="caption"
              className="truncate max-w-[45%] uppercase tracking-wider text-[11px] font-semibold"
              sx={{ color: 'var(--color-brand-text-muted)' }}
            >
              {row.car}
            </Typography>
            
            <Box className="flex items-center gap-1.5 font-mono text-[11px] flex-shrink-0" sx={{ color: 'var(--color-brand-text-muted)' }}>
              <span>{row.laps}L</span>
              <span className="opacity-30">•</span>
              <span style={{ color: 'var(--color-brand-text)' }}>{formatTime(row.totalTime)}</span>
              <span className="opacity-30">•</span>
              
              {row.gap === "-" || row.gap === "0.000" || row.pos === 1 ? (
                <Box 
                  component="span"
                  className="font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded border"
                  sx={{
                    color: 'var(--color-brand-yellow-text)',
                    backgroundColor: 'color-mix(in srgb, var(--color-brand-yellow) 12%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--color-brand-yellow) 20%, transparent)',
                  }}
                >
                  Winner
                </Box>
              ) : (
                <span>{row.gap}</span>
              )}
            </Box>
          </Box>
        </Box>
      </TableCell>
    </PositionedTableRow>
  );
}