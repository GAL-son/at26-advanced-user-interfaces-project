"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TableSortLabel, useMediaQuery, useTheme 
} from '@mui/material';
import { RaceResultExtended } from '../../(routes)/events/page';
import ResultListItem from './ResultListItem';
import ResultListItemMobile from './ResultListItemMobile';

interface ResultListProps {
  results: RaceResultExtended[];
}

type SortField = 'pos' | 'eloChange';
type SortOrder = 'asc' | 'desc';

export default function ResultList({ results }: ResultListProps) {
  const [orderBy, setOrderBy] = useState<SortField>('pos');
  const [order, setOrder] = useState<SortOrder>('asc');
  
  const [isMounted, setIsMounted] = useState(false);
  const theme = useTheme();
  
  // 🔄 ZMIANA: Zamiast 'sm' (640px) ustawiamy sztywną granicę 768px (odpowiednik md w Tailwind)
  // Hook zwróci `true` dla wszystkich ekranów o szerokości mniejszej niż 768px
  const isMobile = useMediaQuery(theme.breakpoints.down(768));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSort = (field: SortField) => {
    const isAsc = orderBy === field && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(field);
  };

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      let comparison = 0;
      if (orderBy === 'pos') comparison = a.pos - b.pos;
      else if (orderBy === 'eloChange') comparison = a.eloChange - b.eloChange;
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
        {/* Nagłówek automatycznie ukryje się poniżej 768px dzięki nowej wartości isMobile */}
        <TableHead 
          sx={{ 
            display: isMounted && isMobile ? 'none' : 'table-header-group',
            backgroundColor: 'var(--color-brand-navy)',
            transition: 'background-color 0.3s ease',
          }}
        >
          <TableRow>
            <TableCell className="w-20 text-center py-3.5" sx={headerCellSx}>
              <TableSortLabel
                active={orderBy === 'pos'}
                direction={orderBy === 'pos' ? order : 'asc'}
                onClick={() => handleSort('pos')}
                sx={sortLabelSx}
              >
                Pos
              </TableSortLabel>
            </TableCell>
            <TableCell className="py-3.5" sx={headerCellSx}>Driver</TableCell>
            <TableCell className="py-3.5" sx={headerCellSx}>
              <TableSortLabel
                active={orderBy === 'eloChange'}
                direction={orderBy === 'eloChange' ? order : 'asc'}
                onClick={() => handleSort('eloChange')}
                sx={sortLabelSx}
              >
                Rating
              </TableSortLabel>
            </TableCell>
            <TableCell className="py-3.5" sx={headerCellSx}>Car</TableCell>
            {/* Ukrywanie kolumny Laps na jeszcze mniejszych desktopach, jeśli zajdzie potrzeba */}
            <TableCell className="text-center py-3.5 hidden md:table-cell" sx={headerCellSx}>Laps</TableCell>
            <TableCell className="py-3.5" sx={headerCellSx}>Total Time</TableCell>
            <TableCell className="py-3.5" sx={headerCellSx}>Gap</TableCell>
          </TableRow>
        </TableHead>
        
        <TableBody>
          {sortedResults.map((row) => {
            if (!isMounted) {
              return <ResultListItem key={row.name} row={row} />;
            }

            // Warunek automatycznie przełączy komponenty przy 768px
            return isMobile ? (
              <ResultListItemMobile key={row.name} row={row} />
            ) : (
              <ResultListItem key={row.name} row={row} />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const headerCellSx = {
  color: 'var(--color-brand-text-muted) !important',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: '1px solid var(--color-brand-navy-light)',
};

const sortLabelSx = {
  color: 'inherit !important',
  '&:hover': { color: 'var(--color-brand-text) !important' },
  '&.Mui-active': { color: 'var(--color-brand-text) !important' },
  '& .MuiTableSortLabel-icon': {
    color: 'var(--color-brand-yellow-text) !important', 
    opacity: '0.8 !important',
  },
};