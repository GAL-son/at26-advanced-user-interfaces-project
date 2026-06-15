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
  align = "center" // ustawiamy domyślnie na "center", aby zachować obecne zachowanie
}: PositionTableCellProps) {
  
  const getPositionStyles = (pos: number) => {
    if (pos === 1) {
      return {
        color: 'var(--color-brand-yellow-text)',
        fontWeight: 900,
        backgroundColor: 'color-mix(in srgb, var(--color-brand-yellow) 12%, transparent)',
      };
    }
    if (pos === 2) {
      return {
        color: 'var(--color-race-silver-text)',
        fontWeight: 700,
        backgroundColor: 'var(--color-race-silver-bg)',
      };
    }
    if (pos === 3) {
      return {
        color: 'var(--color-race-bronze-text)',
        fontWeight: 700,
        backgroundColor: 'var(--color-race-bronze-bg)',
      };
    }
    return {
      color: 'var(--color-brand-text-muted)',
      fontWeight: 500,
    };
  };

  return (
    <TableCell
      component="th"
      scope="row"
      align={align} // Przekazujemy props bezpośrednio do MUI TableCell
      className={`w-16 font-mono text-lg tabular-nums ${className}`} // usunięto sztywne text-center
      sx={{
        ...getPositionStyles(position),
        borderBottom: 'none',
      }}
    >
      {position}
    </TableCell>
  );
}