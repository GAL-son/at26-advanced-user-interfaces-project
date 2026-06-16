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
      /* Modyfikacja v4: 
        - focus-brand obsługuje outline
        - focus:z-10 oraz focus-visible:z-10 przenoszą logikę pozycjonowania warstw do klas,
          co gwarantuje, że podświetlenie focusu nie zostanie ucięte przez sąsiednie wiersze.
      */
      className={`group relative focus-brand focus:z-10 focus-visible:z-10 transition-colors duration-150 ${className}`}
      sx={{
        backgroundColor: 'var(--color-brand-navy-dark)',
        borderBottom: '1px solid var(--color-brand-navy-light)',
        
        '& .MuiTableCell-root': {
          borderBottom: 'none',
        },
        
        '&:hover': {
          backgroundColor: 'color-mix(in srgb, var(--color-brand-text) 4%, var(--color-brand-navy-dark)) !important'
        },
        
        // Bezpieczne scalanie obiektów sx przekazywanych z góry
        ...(Array.isArray(sx) ? sx : [sx]).reduce((acc, current) => ({ ...acc, ...current }), {}),
      }}
    >
      {children}
    </TableRow>
  );
});

PositionedTableRow.displayName = "PositionedTableRow";

export default PositionedTableRow;