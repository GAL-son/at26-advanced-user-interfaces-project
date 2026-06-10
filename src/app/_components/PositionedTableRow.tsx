// src/app/_components/PositionedTableRow.tsx

"use client";
import React from 'react';
import { Box, TableCell, TableRow } from '@mui/material';

interface PositionedTableRowProps {
    position: number;
    children: React.ReactNode;
    onClick?: () => void; // Dodajemy propsa onClick
}

export default function PositionedTableRow({ position, children, onClick }: PositionedTableRowProps) {
    const getPositionStyles = (pos: number) => {
        if (pos === 1) return "!text-brand-yellow font-black bg-brand-yellow/10 dark:bg-brand-yellow/5";
        if (pos === 2) return "!text-race-silver font-bold bg-brand-navy-light/50";
        if (pos === 3) return "!text-race-bronze font-bold bg-race-bronze/10";
        return "!text-brand-muted font-medium";
    };

    const positionStyles = getPositionStyles(position);

    return (
        <TableRow
            sx={{
                '&:hover': {
                    backgroundColor: 'var(--color-brand-navy-light) !important'
                },
                transition: 'background-color 0.15s ease',
            }}
            className="group bg-brand-navy-dark border-b border-brand-navy-light"
            onClick={onClick} // Dodajemy obsługę zdarzenia onClick
        >
            <TableCell className={`text-center w-16 ${getPositionStyles(position)}`}>
                <span className="text-lg tabular-nums">{position}</span>
            </TableCell>
            {children}
        </TableRow>
    );
}