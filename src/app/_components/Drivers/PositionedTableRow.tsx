"use client";
import React, { forwardRef } from 'react';
import { TableRow, SxProps, Theme } from '@mui/material';

interface PositionedTableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  tabIndex?: number;
  "aria-label"?: string;
  className?: string;
  role?: string;
  sx?: SxProps<Theme>;
}

const PositionedTableRow = forwardRef<HTMLTableRowElement, PositionedTableRowProps>(({ 
  children, 
  onClick,
  onKeyDown,
  tabIndex,
  "aria-label": ariaLabel,
  className = "",
  role,
  sx = {}
}, ref) => {
  return (
    <TableRow
      ref={ref}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      role={role}
      // Klasa focus-brand zarządza teraz całością zachowania focusu
      className={`group focus-brand ${className}`}
      sx={{
        backgroundColor: 'var(--color-brand-navy-dark)',
        borderBottom: '1px solid var(--color-brand-navy-light)',
        transition: 'background-color 0.15s ease',
        
        // Bezpieczny z-index przeniesiony bezpośrednio do głównego stanu, 
        // aby zogniskowany wiersz nie chował się pod sąsiadami podczas nakładania box-shadow
        '&:focus-visible': {
          position: 'relative',
          zIndex: 10,
        },
        
        '& .MuiTableCell-root': {
          borderBottom: 'none',
        },
        
        '&:hover': {
          backgroundColor: 'color-mix(in srgb, var(--color-brand-text) 4%, var(--color-brand-navy-dark)) !important'
        },
        
        ...(Array.isArray(sx) ? sx : [sx]).reduce((acc, current) => ({ ...acc, ...current }), {}),
      }}
    >
      {children}
    </TableRow>
  );
});

PositionedTableRow.displayName = "PositionedTableRow";

export default PositionedTableRow;