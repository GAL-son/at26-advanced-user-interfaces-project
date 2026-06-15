"use client";

import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useTranslations } from "next-intl";
import DriverRow from "./DriverRow";
import DriverRowMobile from "./DriverRowMobile";
import { FormattedDriver } from "./DriverRow";
import LoadingSpinner from "@/app/_components/LoadingSpinner";
import { SortOption } from "@/app/_components/Drivers/DriverFilterBar";

interface DriverListProps {
  drivers: FormattedDriver[];
  loading: boolean;
  isInitialLoad: boolean;
  hasMore: boolean;
  sortBy: SortOption;
  observerTargetRef: React.RefObject<HTMLDivElement | null>;
}

export default function DriverList({
  drivers,
  loading,
  isInitialLoad,
  hasMore,
  sortBy,
  observerTargetRef
}: DriverListProps) {
  const t = useTranslations("Drivers");
  const [isMounted, setIsMounted] = useState(false);
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down(768));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const headerClass = "font-bold text-xs uppercase tracking-wider py-3";

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ 
        backgroundImage: 'none', 
        backgroundColor: 'var(--color-brand-navy-dark)',
        border: '1px solid var(--color-brand-navy-light)',
        borderRadius: 'var(--radius-brand-card)',
        overflow: 'hidden'
      }}
      className="shadow-xl"
    >
      {/* WCAG: Zawsze przekazujemy unikalną etykietę dla tabeli */}
      <Table aria-label={t("list.ariaLabel")}>
        <TableHead 
          sx={{ 
            // WCAG FIX: Zamiast display: 'none', który wycina nagłówki z czytników,
            // na mobile stosujemy technikę wizualnego ukrycia. Czytnik nadal widzi strukturę tabeli!
            ...(isMounted && isMobile ? {
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0,
            } : {
              display: 'table-header-group',
            }),
            backgroundColor: 'color-mix(in srgb, var(--color-brand-text) 3%, var(--color-brand-navy-dark))',
            '& .MuiTableCell-head': {
              color: 'var(--color-brand-text-muted)',
              borderBottom: '1px solid var(--color-brand-navy-light)'
            }
          }}
        >
          <TableRow>
            {/* WCAG: Dodano scope="col", aby powiązać nagłówek z komórkami w kolumnie */}
            <TableCell scope="col" align="center" className={`${headerClass} w-16`}>
              {t("list.headers.pos")}
            </TableCell>
            <TableCell scope="col" className={headerClass}>
              {t("list.headers.profile")}
            </TableCell>
            
            <TableCell
              scope="col"
              align="center"
              className={`${headerClass} w-36`}
              // WCAG: Informujemy czytnik, czy kolumna jest aktualnie sortowana
              aria-sort={sortBy === 'races' ? 'descending' : 'none'}
              sx={{
                color: sortBy === 'races' ? 'var(--color-brand-yellow-text) !important' : 'inherit',
                fontWeight: sortBy === 'races' ? '900 !important' : 'inherit'
              }}
            >
              {t("list.headers.races")}
            </TableCell>

            <TableCell
              scope="col"
              align="center"
              className={`${headerClass} w-44`}
              aria-sort={sortBy === 'lastRaced' ? 'descending' : 'none'}
              sx={{
                color: sortBy === 'lastRaced' ? 'var(--color-brand-yellow-text) !important' : 'inherit',
                fontWeight: sortBy === 'lastRaced' ? '900 !important' : 'inherit'
              }}
            >
              {t("list.headers.lastActive")}
            </TableCell>

            <TableCell
              scope="col"
              align="right"
              className={`${headerClass} w-36`}
              aria-sort={sortBy === 'elo' ? 'descending' : 'none'}
              sx={{
                color: sortBy === 'elo' ? 'var(--color-brand-yellow-text) !important' : 'inherit',
                fontWeight: sortBy === 'elo' ? '900 !important' : 'inherit'
              }}
            >
              {t("list.headers.elo")}
            </TableCell>
          </TableRow>
        </TableHead>
        
        <TableBody>
          {drivers.map((driver) => {
            if (!isMounted) {
              return <DriverRow key={driver.guid} driver={driver} />;
            }

            return isMobile ? (
              <DriverRowMobile key={driver.guid} driver={driver} />
            ) : (
              <DriverRow key={driver.guid} driver={driver} />
            );
          })}
        </TableBody>
      </Table>

      {/* INITIAL LOADER */}
      {isInitialLoad && (
        <Box className="py-12 flex justify-center w-full" role="status" aria-live="polite">
          <LoadingSpinner text={t("list.loadingInitial")} />
        </Box>
      )}

      {/* PUSTY STAN */}
      {!isInitialLoad && !loading && drivers.length === 0 && (
        <Typography
          variant="body1"
          role="status"
          aria-live="polite"
          className="text-center py-12 font-medium"
          sx={{ color: 'var(--color-brand-text-muted)' }}
        >
          {t("list.noDrivers")}
        </Typography>
      )}

      {/* BOTTOM LOADER DLA INFINITE SCROLL */}
      {/* Zmieniono na div i dodano ukryty region statusu, by uniknąć chaosu w czytniku */}
      <div
        ref={observerTargetRef}
        className="w-full py-6 flex justify-center"
        style={{ 
          backgroundColor: 'color-mix(in srgb, var(--color-brand-text) 1.5%, transparent)',
          borderTop: '1px solid var(--color-brand-navy-light)'
        }}
      >
        {loading && !isInitialLoad && (
          <Box role="status" aria-live="polite">
            <LoadingSpinner text={t("list.loadingMore")} />
          </Box>
        )}
        {!hasMore && drivers.length > 0 && (
          <span 
            className="text-[10px] font-mono uppercase tracking-widest font-black"
            style={{ color: 'var(--color-brand-text-muted)', opacity: 0.5 }}
          >
            {t("list.terminalReached")}
          </span>
        )}
      </div>
    </TableContainer>
  );
}