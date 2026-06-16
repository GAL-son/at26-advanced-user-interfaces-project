"use client";
import React from 'react';
import { TableCell, Box, Typography } from '@mui/material';
import { RaceResultExtended } from '../[id]/page';
import ComboBadge from '@/app/_components/Elo/ComboBadge';
import PositionedTableRow from '@/app/_components/Drivers/PositionedTableRow';
import PositionTableCell from '@/app/_components/Common/PositionTableCell';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Transition } from 'framer-motion';

interface ResultListItemMobileProps {
  id?: string;
  row: RaceResultExtended;
  index: number;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  registerRef: (el: HTMLElement | null) => void;
  transition?: Transition;
}

export default function ResultListItemMobile({
  id,
  row,
  index,
  onKeyDown,
  registerRef,
  transition,
}: ResultListItemMobileProps) {
  const t = useTranslations("Results.table");
  const router = useRouter();

  const handleNavigation = () => {
    router.push(`/drivers/${row.guid}`);
  };

  const handleCombinedKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavigation();
      return;
    }

    // To wywoła naszą funkcję strzałek z poprawnym przypisanym indeksem
    onKeyDown(e);
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
      ref={registerRef}
      onClick={handleNavigation}
      onKeyDown={handleCombinedKeyDown}
      transition={transition}
      tabIndex={0}
      role="link"
      aria-label={`${row.pos}. ${row.name}, ${t("goToProfile")}`}
      className="focus-brand"
      sx={{
        display: { xs: 'table-row', md: 'none' },
        cursor: 'pointer',
        "&:focus, &:focus-visible": {
          outline: "none",
        }
      }}
    >
      <PositionTableCell
        position={row.pos}
        className="!p-2"
      />

      <TableCell
        colSpan={5}
        sx={{
          p: 2,
          borderBottom: '1px solid var(--color-brand-navy-light)',
          width: '100%',
        }}
      >
        <Box className="flex flex-col gap-1.5 w-full">
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

            <Box
              className="flex items-center gap-1.5 font-mono text-sm font-semibold flex-shrink-0"
              sx={{ color: 'var(--color-brand-text)' }}
            >
              <Box component="span">{row.eloAfter}</Box>
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

          <Box className="flex justify-between items-center w-full text-xs font-medium">
            <Typography
              variant="caption"
              className="truncate max-w-[45%] uppercase tracking-wider text-[11px] font-semibold"
              sx={{ color: 'var(--color-brand-text-muted)' }}
            >
              {row.car}
            </Typography>

            <Box
              className="flex items-center gap-1.5 font-mono text-[11px] flex-shrink-0"
              sx={{ color: 'var(--color-brand-text-muted)' }}
            >
              <Box component="span">{row.laps}L</Box>
              <Box component="span" className="opacity-30">•</Box>
              <Box component="span" sx={{ color: 'var(--color-brand-text)' }}>{formatTime(row.totalTime)}</Box>
              <Box component="span" className="opacity-30">•</Box>

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
                  {t("winner")}
                </Box>
              ) : (
                <Box component="span">{row.gap}</Box>
              )}
            </Box>
          </Box>
        </Box>
      </TableCell>
    </PositionedTableRow>
  );
}