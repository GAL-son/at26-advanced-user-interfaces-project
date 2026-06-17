"use client";

import React from 'react';
import { TableCell, Box } from '@mui/material';
import ComboBadge from '@/app/_components/Elo/ComboBadge';
import PositionedTableRow from '@/app/_components/Drivers/PositionedTableRow';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import PositionTableCell from '../Common/PositionTableCell';
import { Transition } from 'framer-motion';

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
  id?: string;
  row: RaceResultExtended;
  index: number;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  registerRef: (el: HTMLElement | null) => void;
  transition?: Transition;
}

export default function ResultListItem({
  id,
  row,
  index,
  onKeyDown,
  registerRef,
  transition,
}: ResultListItemProps) {
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
        display: { xs: 'none', md: 'table-row' },
        cursor: 'pointer',
        "&:focus, &:focus-visible": {
          outline: "none",
        }
      }}
    >
      <PositionTableCell position={row.pos} />

      {/* Nazwa Kierowcy */}
      <TableCell className="py-4">
        <Box className="flex items-center gap-2">
          {/* POPRAWKA: Przejście na unifikowany kolor tekstu interfejsu */}
          <span className="text-[var(--color-brand-text-muted)] font-medium">{row.name}</span>
          {row.combo > 0 && <ComboBadge combo={row.combo} />}
        </Box>
      </TableCell>

      {/* Punkty ELO + Zmiana */}
      <TableCell>
        <Box className="flex items-center gap-2">
          {/* POPRAWKA: Token !text-btn-mono dla głównej wartości ELO */}
          <span className="!text-btn-mono text-[var(--color-brand-text)]">
            {row.eloAfter}
          </span>
          <Box
            component="span"
            /* POPRAWKA: Usunięcie sx blocku stylów inline i przeniesienie logiki kolorowania na natywne klasy narzędziowe v4 */
            className={`ml-1 px-1.5 py-0.5 rounded !text-btn-mono font-bold border ${
              isGain 
                ? 'bg-[color-mix(in_srgb,var(--color-elo-gain)_10%,transparent)] text-[var(--color-elo-gain)] border-[color-mix(in_srgb,var(--color-elo-gain)_20%,transparent)]'
                : 'bg-[color-mix(in_srgb,var(--color-elo-loss)_10%,transparent)] text-[var(--color-elo-loss)] border-[color-mix(in_srgb,var(--color-elo-loss)_20%,transparent)]'
            }`}
          >
            {isGain ? `+${row.eloChange}` : row.eloChange}
          </Box>
        </Box>
      </TableCell>

      {/* Nazwa Samochodu */}
      <TableCell className="hidden md:table-cell">
        {/* POPRAWKA: Zmiana na token !text-data-mono z wymuszonym uppercase i kolorem wyciszonym */}
        <span className="!text-data-mono uppercase text-[var(--color-brand-text-muted)]">
          {row.car}
        </span>
      </TableCell>

      {/* Liczba Okrążeń */}
      <TableCell className="text-center hidden md:table-cell">
        {/* POPRAWKA: Token !text-data-mono */}
        <span className="!text-data-mono text-[var(--color-brand-text-muted)]">
          {row.laps}
        </span>
      </TableCell>

      {/* Łączny Czas */}
      <TableCell>
        {/* POPRAWKA: Token !text-data-mono z kolorem pełnego tekstu */}
        <span className="!text-data-mono text-[var(--color-brand-text)] font-semibold">
          {formatTime(row.totalTime)}
        </span>
      </TableCell>

      {/* Różnica (Gap) / Zwycięzca */}
      <TableCell>
        {row.gap === "-" || row.gap === "0.000" || row.pos === 1 ? (
          <Box
            component="span"
            /* POPRAWKA: Zmiana rozmiaru czcionki na zunifikowany token HUD, rezygnacja z sx */
            className="font-bold !text-btn-mono uppercase tracking-wider px-1.5 py-0.5 rounded border bg-[color-mix(in_srgb,var(--color-brand-yellow)_12%,transparent)] text-[var(--color-brand-yellow-text)] border-[color-mix(in_srgb,var(--color-brand-yellow)_20%,transparent)]"
          >
            {t("winner")}
          </Box>
        ) : (
          /* POPRAWKA: Token !text-data-mono dla klasycznych różnic czasowych */
          <span className="!text-data-mono text-[var(--color-brand-text-muted)]">
            {row.gap}
          </span>
        )}
      </TableCell>
    </PositionedTableRow>
  );
}