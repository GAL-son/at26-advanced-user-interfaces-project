"use client";
import React from 'react';
import { TableCell } from '@mui/material';

interface PositionTableCellProps {
  position: number;
  className?: string;
  /** Opcjonalne wyrównanie zawartości komórki (domyślnie 'center') */
  align?: 'left' | 'center' | 'right' | 'inherit' | 'justify';
}

export default function PositionTableCell({ 
  position, 
  className = "", 
  align = "center" 
}: PositionTableCellProps) {
  
  const getPositionStyles = (pos: number) => {
    if (pos === 1) {
      return {
        color: 'var(--color-brand-yellow-text)',
        backgroundColor: 'color-mix(in srgb, var(--color-brand-yellow) 12%, transparent)',
      };
    }
    if (pos === 2) {
      return {
        color: 'var(--color-race-silver-text)',
        backgroundColor: 'var(--color-race-silver-bg)',
      };
    }
    if (pos === 3) {
      return {
        color: 'var(--color-race-bronze-text)',
        backgroundColor: 'var(--color-race-bronze-bg)',
      };
    }
    return {
      color: 'var(--color-brand-text-muted)',
    };
  };

  // Dobieramy wage fontu zależnie od pozycji na podium
  const getPodiumWeight = (pos: number) => {
    if (pos === 1) return "font-black";
    if (pos === 2 || pos === 3) return "font-bold";
    return "font-medium";
  };

  return (
    <TableCell
      component="th"
      scope="row"
      align={align}
      /* ZASTOSOWANIE ROZMIARÓW I CZCIONKI:
        - !text-stat-value wstrzykuje Share Tech Mono oraz dynamiczny rozmiar (1.5rem na mobile -> 1.875rem na desktopie)
        - tabular-nums stabilizuje szerokość cyfr w tabeli, aby nie skakały przy odświeżaniu
      */
      className={`w-16 !text-stat-value ${getPodiumWeight(position)} tabular-nums ${className}`}
      sx={{
        ...getPositionStyles(position),
        borderBottom: 'none',
      }}
    >
      {position}
    </TableCell>
  );
}