"use client";
import React, { useState, useMemo } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TableSortLabel, Box 
} from '@mui/material';
import { RaceResultExtended } from '../../(routes)/events/page';
import ResultListItem from './ResultListItem';

interface ResultListProps {
  results: RaceResultExtended[];
}

type SortField = 'pos' | 'eloChange';
type SortOrder = 'asc' | 'desc';

export default function ResultList({ results }: ResultListProps) {
  const [orderBy, setOrderBy] = useState<SortField>('pos');
  const [order, setOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    const isAsc = orderBy === field && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(field);
  };

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      let comparison = 0;
      
      if (orderBy === 'pos') {
        comparison = a.pos - b.pos;
      } else if (orderBy === 'eloChange') {
        comparison = a.eloChange - b.eloChange;
      }

      return order === 'asc' ? comparison : -comparison;
    });
  }, [results, orderBy, order]);

  // Klasy pomocnicze dla nagłówków, aby wymusić styl na MUI
  const headerCellClass = "!text-slate-400 !font-bold text-xs uppercase tracking-wider py-3.5 border-b border-brand-navy-light/60";

  return (
    <TableContainer 
      className="bg-brand-navy-dark border border-brand-navy-light/40 rounded-xl overflow-hidden shadow-2xl shadow-black/40"
    >
      <Table aria-label="Race results table with ELO changes">
        <TableHead className="bg-brand-navy">
          <TableRow>
            
            {/* POSITION (Sortable) */}
            <TableCell className={`${headerCellClass} w-20 text-center`}>
              <TableSortLabel
                active={orderBy === 'pos'}
                direction={orderBy === 'pos' ? order : 'asc'}
                onClick={() => handleSort('pos')}
                aria-label="Sort by position"
                sx={{
                  color: 'inherit !important',
                  '& .MuiTableSortLabel-icon': {
                    color: '#fff200 !important', // Kolor strzałki sortowania (nasz żółty)
                  },
                }}
              >
                Pos
              </TableSortLabel>
            </TableCell>

            {/* DRIVER */}
            <TableCell className={headerCellClass}>
              Driver
            </TableCell>

            {/* ELO CHANGE (Sortable) */}
            <TableCell className={headerCellClass}>
              <TableSortLabel
                active={orderBy === 'eloChange'}
                direction={orderBy === 'eloChange' ? order : 'asc'}
                onClick={() => handleSort('eloChange')}
                aria-label="Sort by ELO change"
                sx={{
                  color: 'inherit !important',
                  '& .MuiTableSortLabel-icon': {
                    color: '#fff200 !important',
                  },
                }}
              >
                Rating
              </TableSortLabel>
            </TableCell>

            {/* CAR */}
            <TableCell className={headerCellClass}>
              Car
            </TableCell>

            {/* LAPS */}
            <TableCell className={`${headerCellClass} text-center`}>
              Laps
            </TableCell>

            {/* TOTAL TIME */}
            <TableCell className={headerCellClass}>
              Total Time
            </TableCell>

            {/* GAP */}
            <TableCell className={headerCellClass}>
              Gap
            </TableCell>

          </TableRow>
        </TableHead>
        
        <TableBody className="divide-y divide-brand-navy-light/20">
          {sortedResults.map((row) => (
            <ResultListItem key={row.name} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}