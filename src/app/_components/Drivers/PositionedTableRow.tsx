"use client";
import React from 'react';
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

export default function PositionedTableRow({ 
  children, 
  onClick,
  onKeyDown,
  tabIndex,
  "aria-label": ariaLabel,
  className = "",
  role,
  sx = {}
}: PositionedTableRowProps) {
  return (
    <TableRow
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      role={role}
      className={`group ${className}`}
      sx={{
        backgroundColor: 'var(--color-brand-navy-dark)',
        borderBottom: '1px solid var(--color-brand-navy-light)',
        transition: 'background-color 0.15s ease',
        
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
}