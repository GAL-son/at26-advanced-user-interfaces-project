"use client";
import React from 'react';
import { Box, TableCell } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { RaceResultExtended } from '@/app/_pages/EventResultPage';
import ComboBadge from '@/app/_components/Elo/ComboBadge';
import PositionedTableRow from '@/app/_components/Drivers/PositionedTableRow';

interface DriverResultProps {
  row: RaceResultExtended;
}

export default function DriverResult({ row }: DriverResultProps) {
  const isGain = row.eloChange >= 0;

  return (
    <PositionedTableRow>
      {/* Combo */}
      <TableCell>
        <Box className="flex items-center gap-2">
          {row.combo > 0 && (
            <ComboBadge combo={row.combo} />
          )}
        </Box>
      </TableCell>

      {/* ZMIANA ELO */}
      <TableCell>
        <Box className="flex items-center gap-2 font-mono text-sm">
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
      <TableCell className="!text-brand-muted/80 font-medium text-xs tracking-wide uppercase">
        {row.car}
      </TableCell>

      {/* GAP DO LEADERA */}
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