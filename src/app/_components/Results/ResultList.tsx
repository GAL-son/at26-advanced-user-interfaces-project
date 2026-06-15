"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TableSortLabel, useMediaQuery, useTheme 
} from '@mui/material';
import { RaceResultExtended } from '../[id]/page';
import ResultListItem from './ResultListItem';
import ResultListItemMobile from './ResultListItemMobile';
import { useTranslations } from 'next-intl';
import { useKeyboardNavigation } from "@/app/_hooks/useKeyboardNavigation";

interface ResultListProps {
  results: RaceResultExtended[];
  onNavigateVertical?: (direction: "up" | "down") => void;
}

type SortField = 'pos' | 'eloChange';
type SortOrder = 'asc' | 'desc';

export default function ResultList({ results, onNavigateVertical }: ResultListProps) {
  const t = useTranslations("Results.table");
  const [orderBy, setOrderBy] = useState<SortField>('pos');
  const [order, setOrder] = useState<SortOrder>('asc');
  
  const [isMounted, setIsMounted] = useState(false);
  const theme = useTheme();
  
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

  // Podpinamy hook nawigacji klawiaturą dla wierszy wyników
  const { registerItem, handleKeyDown } = useKeyboardNavigation({
    itemCount: sortedResults.length,
    orientation: "vertical",
    loop: false,
    onLeave: (direction) => {
      if (direction === "prev" && onNavigateVertical) {
        // Wyjście strzałką w górę z pierwszego elementu tabeli
        onNavigateVertical("up");
      } else if (direction === "next" && onNavigateVertical) {
        // Wyjście strzałką w dół z ostatniego elementu tabeli
        onNavigateVertical("down");
      }
    }
  });

  const getAriaSort = (field: SortField) => {
    if (orderBy !== field) return 'none';
    return order === 'asc' ? 'ascending' : 'descending';
  };

  return (
    <TableContainer 
      className="rounded-xl overflow-hidden shadow-xl"
      sx={{
        backgroundColor: 'var(--color-brand-navy-dark)',
        border: '1px solid var(--color-brand-navy-light)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}
    >
      <Table aria-label={t("tableAria")}>
        <TableHead 
          sx={{ 
            display: isMounted && isMobile ? 'none' : 'table-header-group',
            backgroundColor: 'var(--color-brand-navy)',
            transition: 'background-color 0.3s ease',
          }}
        >
          <TableRow>
            <TableCell 
              className="w-20 text-center py-3.5" 
              sx={headerCellSx}
              aria-sort={getAriaSort('pos')}
            >
              <TableSortLabel
                active={orderBy === 'pos'}
                direction={orderBy === 'pos' ? order : 'asc'}
                onClick={() => handleSort('pos')}
                sx={sortLabelSx}
              >
                {t("pos")}
              </TableSortLabel>
            </TableCell>
            
            <TableCell className="py-3.5" sx={headerCellSx}>
              {t("driver")}
            </TableCell>
            
            <TableCell 
              className="py-3.5" 
              sx={headerCellSx}
              aria-sort={getAriaSort('eloChange')}
            >
              <TableSortLabel
                active={orderBy === 'eloChange'}
                direction={orderBy === 'eloChange' ? order : 'asc'}
                onClick={() => handleSort('eloChange')}
                sx={sortLabelSx}
              >
                {t("rating")}
              </TableSortLabel>
            </TableCell>
            
            <TableCell className="py-3.5" sx={headerCellSx}>
              {t("car")}
            </TableCell>
            
            <TableCell className="text-center py-3.5 hidden md:table-cell" sx={headerCellSx}>
              {t("laps")}
            </TableCell>
            
            <TableCell className="py-3.5" sx={headerCellSx}>
              {t("totalTime")}
            </TableCell>
            
            <TableCell className="py-3.5" sx={headerCellSx}>
              {t("gap")}
            </TableCell>
          </TableRow>
        </TableHead>
        
        <TableBody>
          {sortedResults.map((row, index) => {
            const rowKey = row.guid || row.name;
            const uniqueId = `result-row-${rowKey}`;

            const keyProps = {
              id: uniqueId,
              row: row,
              index: index,
              onKeyDown: handleKeyDown,
              registerRef: registerItem(index)
            };

            return isMounted && isMobile ? (
              <ResultListItemMobile key={rowKey} {...keyProps} />
            ) : (
              <ResultListItem key={rowKey} {...keyProps} />
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