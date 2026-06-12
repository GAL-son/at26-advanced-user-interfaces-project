"use client";
import React, { useState, useMemo } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TableSortLabel 
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

  return (
    <TableContainer 
      className="rounded-xl overflow-hidden shadow-xl"
      sx={{
        backgroundColor: 'var(--color-brand-navy-dark)',
        border: '1px solid var(--color-brand-navy-light)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}
    >
      <Table aria-label="Race results table with ELO changes">
        <TableHead 
          sx={{ 
            backgroundColor: 'var(--color-brand-navy)',
            transition: 'background-color 0.3s ease',
          }}
        >
          <TableRow>
            
            {/* POSITION (Sortable) */}
            <TableCell 
              className="w-20 text-center py-3.5"
              sx={{ ...headerCellSx }}
            >
              <TableSortLabel
                active={orderBy === 'pos'}
                direction={orderBy === 'pos' ? order : 'asc'}
                onClick={() => handleSort('pos')}
                aria-label="Sort by position"
                sx={sortLabelSx}
              >
                Pos
              </TableSortLabel>
            </TableCell>

            {/* DRIVER */}
            <TableCell className="py-3.5" sx={headerCellSx}>
              Driver
            </TableCell>

            {/* ELO CHANGE (Sortable) */}
            <TableCell className="py-3.5" sx={headerCellSx}>
              <TableSortLabel
                active={orderBy === 'eloChange'}
                direction={orderBy === 'eloChange' ? order : 'asc'}
                onClick={() => handleSort('eloChange')}
                aria-label="Sort by ELO change"
                sx={sortLabelSx}
              >
                Rating
              </TableSortLabel>
            </TableCell>

            {/* CAR */}
            <TableCell className="py-3.5" sx={headerCellSx}>
              Car
            </TableCell>

            {/* LAPS */}
            <TableCell className="text-center py-3.5" sx={headerCellSx}>
              Laps
            </TableCell>

            {/* TOTAL TIME */}
            <TableCell className="py-3.5" sx={headerCellSx}>
              Total Time
            </TableCell>

            {/* GAP */}
            <TableCell className="py-3.5" sx={headerCellSx}>
              Gap
            </TableCell>

          </TableRow>
        </TableHead>
        
        <TableBody>
          {sortedResults.map((row) => (
            <ResultListItem key={row.name} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// 📌 Style współdzielone dla komórek nagłówka (reagujące na motyw)
const headerCellSx = {
  color: 'var(--color-brand-text-muted) !important',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: '1px solid var(--color-brand-navy-light)',
};

// 📌 Style dla etykiet sortowania i dynamicznego dopasowania koloru strzałki
const sortLabelSx = {
  color: 'inherit !important',
  '&:hover': {
    color: 'var(--color-brand-text) !important',
  },
  '&.Mui-active': {
    color: 'var(--color-brand-text) !important',
  },
  '& .MuiTableSortLabel-icon': {
    // Dynamiczny kolor strzałki reagujący na tryb jasny (ciemny złoty) i ciemny (jaskrawy żółty)
    color: 'var(--color-brand-yellow-text) !important', 
    opacity: '0.8 !important',
  },
};