"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TableSortLabel, useMediaQuery, useTheme
} from '@mui/material';
import { RaceResultExtended } from '@/app/_pages/EventResultPage';
import ResultListItem from './ResultListItem';
import ResultListItemMobile from './ResultListItemMobile';
import { useTranslations } from 'next-intl';
import { useKeyboardNavigation } from "@/app/_hooks/useKeyboardNavigation";
import { AnimatePresence } from 'framer-motion';

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

  // Bezpieczna referencja do przechowywania fizycznego wskaźnika na PIERWSZY wiersz tabeli
  const firstRowRef = useRef<HTMLElement | null>(null);

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

  // Główna nawigacja pionowa po wierszach danych
  const { registerItem, handleKeyDown } = useKeyboardNavigation({
    itemCount: sortedResults.length,
    orientation: "vertical",
    loop: false,
    onLeave: (direction) => {
      if (direction === "prev") {
        const firstHeader = document.getElementById("header-sort-pos");
        firstHeader?.focus();
      } else if (direction === "next" && onNavigateVertical) {
        onNavigateVertical("down");
      }
    }
  });

  // Lekka, lokalna obsługa strzałek dla nagłówków tabeli
  const handleHeaderKeyDownLocal = (e: React.KeyboardEvent<HTMLElement>, currentField: SortField) => {
    if (e.key === "ArrowRight" && currentField === "pos") {
      e.preventDefault();
      document.getElementById("header-sort-elo")?.focus();
    }
    if (e.key === "ArrowLeft" && currentField === "eloChange") {
      e.preventDefault();
      document.getElementById("header-sort-pos")?.focus();
    }

    // POPRAWKA: Reaguje na strzałkę w dół na dowolnym nagłówku LUB strzałkę w prawo na ostatnim nagłówku
    if (e.key === "ArrowDown" || (e.key === "ArrowRight" && currentField === "eloChange")) {
      e.preventDefault();
      // Pancerne i bezpośrednie wywołanie focusu z pominięciem stringowych ID
      if (firstRowRef.current) {
        firstRowRef.current.focus();
      }
    }

    if (e.key === "ArrowUp" && onNavigateVertical) {
      e.preventDefault();
      onNavigateVertical("up");
    }
  };

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
            {/* Nagłówek: Pozycja */}
            <TableCell
              className="w-20 text-center py-3.5"
              sx={headerCellSx}
              aria-sort={getAriaSort('pos')}
            >
              <TableSortLabel
                id="header-sort-pos"
                active={orderBy === 'pos'}
                direction={orderBy === 'pos' ? order : 'asc'}
                onClick={() => handleSort('pos')}
                onKeyDown={(e) => handleHeaderKeyDownLocal(e, 'pos')}
                data-focus-order="primary"
                tabIndex={0}
                className="focus-brand"
                sx={sortLabelSx}
              >
                {t("pos")}
              </TableSortLabel>
            </TableCell>

            <TableCell className="py-3.5" sx={headerCellSx}>
              {t("driver")}
            </TableCell>

            {/* Nagłówek: Elo */}
            <TableCell
              className="py-3.5"
              sx={headerCellSx}
              aria-sort={getAriaSort('eloChange')}
            >
              <TableSortLabel
                id="header-sort-elo"
                active={orderBy === 'eloChange'}
                direction={orderBy === 'eloChange' ? order : 'asc'}
                onClick={() => handleSort('eloChange')}
                onKeyDown={(e) => handleHeaderKeyDownLocal(e, 'eloChange')}
                tabIndex={-1}
                className="focus-brand"
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
          <AnimatePresence mode='popLayout'>
            {sortedResults.map((row, index) => {
              const rowKey = row.guid || row.name;
              const uniqueId = `result-row-${rowKey}`;

              const keyProps = {
                id: uniqueId,
                row: row,
                index: index,
                onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => handleKeyDown(e, index),
                // Łączymy rejestrację hooka z przechwytywaniem pierwszego elementu do naszej referencji
                registerRef: (el: HTMLElement | null) => {
                  registerItem(index)(el);
                  if (index === 0) {
                    firstRowRef.current = el;
                  }
                },
                transition: { duration: 0.2, delay: index * 0.05 },
              };

              return isMounted && isMobile ? (
                <ResultListItemMobile key={rowKey} {...keyProps} />
              ) : (
                <ResultListItem key={rowKey} {...keyProps} />
              );
            })}
          </AnimatePresence>
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
  borderRadius: '4px',
  px: 0.5,
  '&:focus, &:focus-visible': {
    outline: 'none',
  },
  '&:hover': { color: 'var(--color-brand-text) !important' },
  '&.Mui-active': { color: 'var(--color-brand-text) !important' },
  '& .MuiTableSortLabel-icon': {
    color: 'var(--color-brand-yellow-text) !important',
    opacity: '0.8 !important',
  },
};