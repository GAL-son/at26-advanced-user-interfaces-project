"use client";
import React, { forwardRef } from 'react';
import { TableRow, SxProps, Theme } from '@mui/material';
import { motion, Transition } from 'framer-motion';

// POPRAWKA: Zamiana motion(TableRow) na motion.create(TableRow)
const MotionTableRow = motion.create(TableRow);

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit:   { opacity: 0, x: -20 },
};

interface PositionedTableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  tabIndex?: number;
  "aria-label"?: string;
  className?: string;
  role?: string;
  sx?: SxProps<Theme>;
  transition?: Transition;
}

const PositionedTableRow = forwardRef<HTMLTableRowElement, PositionedTableRowProps>(({
  children,
  onClick,
  onKeyDown,
  tabIndex,
  "aria-label": ariaLabel,
  className = "",
  role,
  sx = {},
  transition,
}, ref) => {
  return (
    <MotionTableRow
      ref={ref}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      role={role}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      transition={transition ?? { duration: 0.2 }}
      className={`group relative focus-brand focus:z-10 focus-visible:z-10 transition-colors duration-150 ${className}`}
      sx={{
        backgroundColor: 'var(--color-brand-navy-dark)',
        borderBottom: '1px solid var(--color-brand-navy-light)',
        '& .MuiTableCell-root': { borderBottom: 'none' },
        '&:hover': {
          backgroundColor: 'color-mix(in srgb, var(--color-brand-text) 4%, var(--color-brand-navy-dark)) !important'
        },
        ...(Array.isArray(sx) ? sx : [sx]).reduce((acc, cur) => ({ ...acc, ...cur }), {}),
      }}
    >
      {children}
    </MotionTableRow>
  );
});

PositionedTableRow.displayName = "PositionedTableRow";
export default PositionedTableRow;