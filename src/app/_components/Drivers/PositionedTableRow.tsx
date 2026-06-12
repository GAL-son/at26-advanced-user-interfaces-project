"use client";
import React from 'react';
import { TableCell, TableRow } from '@mui/material';

interface PositionedTableRowProps {
    displayPosition?: boolean;
    position: number;
    children: React.ReactNode;
    onClick?: () => void;
}

export default function PositionedTableRow({ displayPosition = true, position, children, onClick }: PositionedTableRowProps) {
    
    const getPositionSxStyles = (pos: number) => {
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
        <TableRow
            onClick={onClick}
            className="group cursor-pointer"
            sx={{
                backgroundColor: 'var(--color-brand-navy-dark)',
                borderBottom: '1px solid var(--color-brand-navy-light)',
                transition: 'background-color 0.15s ease',
                
                // ROZWIĄZANIE: Usuwamy domyślny border MUI dla WSZYSTKICH komórek w tym wierszu
                '& .MuiTableCell-root': {
                    borderBottom: 'none',
                },
                
                // Efekt hover bezpieczny dla obu trybów wyświetlania
                '&:hover': {
                    backgroundColor: 'color-mix(in srgb, var(--color-brand-text) 4%, var(--color-brand-navy-dark)) !important'
                },
            }}
        >
            {displayPosition && (
                <TableCell 
                    className="text-center w-16"
                    sx={{
                        ...getPositionSxStyles(position),
                        // borderBottom: 'none' -> już niepotrzebne, bo załatwia to selektor wyżej
                    }}
                >
                    <span className="text-lg tabular-nums">{position}</span>
                </TableCell>
            )}

            {children}
        </TableRow>
    );
}