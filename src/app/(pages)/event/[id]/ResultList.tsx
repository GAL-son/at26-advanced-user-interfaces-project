"use client";
import React, { useState, useMemo } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, TableSortLabel, Box 
} from '@mui/material';
import { RaceResultExtended } from '../page';
import ResultListItem from './ResultListItem';

interface ResultListProps {
  results: RaceResultExtended[];
}

type SortField = 'pos' | 'eloChange';
type SortOrder = 'asc' | 'desc';

export default function ResultList({ results }: ResultListProps) {
  const [orderBy, setOrderBy] = useState<SortField>('pos');
  const [order, setOrder] = useState<SortOrder>('asc');

  // Funkcja obsługująca przełączanie sortowania po kliknięciu nagłówka
  const handleSort = (field: SortField) => {
    const isAsc = orderBy === field && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(field);
  };

  // Logika sortowania za pomocą useMemo (wydajność)
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
      component={Paper} 
      sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }} 
      elevation={0}
    >
      <Table aria-label="Tabela wyników wyścigu ze zmianami punktów ELO">
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            {/* Sortowalny nagłówek pozycji */}
            <TableCell sx={{ fontWeight: 700, width: '90px' }}>
              <TableSortLabel
                active={orderBy === 'pos'}
                direction={orderBy === 'pos' ? order : 'asc'}
                onClick={() => handleSort('pos')}
                aria-label="Sortuj po pozycji"
              >
                Poz.
              </TableSortLabel>
            </TableCell>

            {/* Standardowy nagłówek */}
            <TableCell sx={{ fontWeight: 700 }}>Kierowca</TableCell>

            {/* Sortowalny nagłówek Zmiany ELO */}
            <TableCell sx={{ fontWeight: 700 }}>
              <TableSortLabel
                active={orderBy === 'eloChange'}
                direction={orderBy === 'eloChange' ? order : 'asc'}
                onClick={() => handleSort('eloChange')}
                aria-label="Sortuj po zmianie punktów ELO"
              >
                Zmiana ELO
              </TableSortLabel>
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}>Samochód</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Okr.</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Czas łączny</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Strata</TableCell>
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