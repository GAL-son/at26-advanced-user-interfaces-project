"use client";
import React from 'react';

interface PositionTableCellProps {
  position: number;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'inherit' | 'justify';
}

export default function PositionTableCell({ 
  position, 
  className = "", 
  align = "center" 
}: PositionTableCellProps) {
  
  const getPositionClasses = (pos: number) => {
    if (pos === 1) {
      return "text-[var(--color-brand-yellow-text)] bg-[color-mix(in_srgb,var(--color-brand-yellow)_12%,transparent)] font-black";
    }
    if (pos === 2) {
      return "text-[var(--color-race-silver-text)] bg-[var(--color-race-silver-bg)] font-bold";
    }
    if (pos === 3) {
      return "text-[var(--color-race-bronze-text)] bg-[var(--color-race-bronze-bg)] font-bold";
    }
    return "text-[var(--color-brand-text-muted)] font-medium";
  };

  const getAlignClass = (alignment: string) => {
    switch (alignment) {
      case 'left': return 'text-left';
      case 'right': return 'text-right';
      case 'justify': return 'text-justify';
      case 'inherit': return '';
      case 'center':
      default: return 'text-center';
    }
  };

  return (
    <td
      className={`
        w-16 min-w-[4rem] align-middle tabular-nums text-stat-value py-2 px-4
        ${getAlignClass(align)} 
        ${getPositionClasses(position)} 
        ${className}
      `.trim()}
    >
      {position}
    </td>
  );
}