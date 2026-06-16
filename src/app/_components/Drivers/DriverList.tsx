"use client";

import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useTranslations } from "next-intl";
import DriverRow from "./DriverRow";
import DriverRowMobile from "./DriverRowMobile";
import { FormattedDriver } from "./DriverRow";
import LoadingSpinner from "@/app/_components/LoadingSpinner";
import { SortOption } from "@/app/_components/Drivers/DriverFilterBar";
import { useKeyboardNavigation } from "@/app/_hooks/useKeyboardNavigation";
import ScrollArrow from "@/app/_components/Common/ScrollArrow";
import { useScrollArrowVisibility } from "@/app/_hooks/useScrollArrowVisibility";
import { motion, AnimatePresence } from "framer-motion";

interface DriverListProps {
  drivers: FormattedDriver[];
  loading: boolean;
  isInitialLoad: boolean;
  hasMore: boolean;
  sortBy: SortOption;
  observerTargetRef: React.RefObject<HTMLDivElement | null>;
  onNavigateVertical: (direction: "up" | "down") => void;
  loadMoreDrivers: () => void;
}

export default function DriverList({
  drivers,
  loading,
  isInitialLoad,
  hasMore,
  sortBy,
  observerTargetRef,
  onNavigateVertical,
  loadMoreDrivers
}: DriverListProps) {
  const t = useTranslations("Drivers");
  const [isMounted, setIsMounted] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(768));

  const shouldShowArrow = useScrollArrowVisibility(observerTargetRef, {
    hasMore: hasMore,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { registerItem, handleKeyDown } = useKeyboardNavigation({
    itemCount: drivers.length,
    orientation: "vertical",
    loop: false,
    onLeave: (direction) => {
      if (direction === "prev") {
        onNavigateVertical("up");
      } else if (direction === "next" && hasMore && !loading) {
        loadMoreDrivers();
      }
    }
  });

  /* POPRAWKA: Wymuszenie czcionki podstawowej !font-sans oraz spójnego rozmiaru text-xs dla nagłówków tabeli */
  const headerClass = "font-bold text-xs uppercase tracking-wider py-3 !font-sans";

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        backgroundImage: 'none',
        backgroundColor: 'var(--color-brand-navy-dark)',
        border: '1px solid var(--color-brand-navy-light)',
        borderRadius: 'var(--radius-brand-card)',
        overflow: 'hidden',
        position: 'relative'
      }}
      className="shadow-xl"
    >
      <Table aria-label={t("list.ariaLabel")}>
        <TableHead
          sx={{
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
              borderBottom: '1px solid var(--color-brand-navy-light)',
              fontFamily: 'var(--font-sans) !important' /* Bezpiecznik dla JSS MUI */
            }
          }}
        >
          <TableRow>
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

        <TableBody>                              {/* ← zwykły TableBody, bez motion.tbody */}
          <AnimatePresence mode="popLayout">
            {drivers.map((driver, index) => {
              const keyProps = {
                driver,
                index,
                onKeyDown: handleKeyDown,
                registerRef: registerItem(index),
                transition: { duration: 0.2, delay: index * 0.05 }, // ← kaskada przez prop
              };

              return isMounted && isMobile ? (
                <DriverRowMobile key={driver.guid} {...keyProps} />
              ) : (
                <DriverRow key={driver.guid} {...keyProps} />
              );
            })}
          </AnimatePresence>
        </TableBody>
      </Table>

      {isInitialLoad && (
        <Box className="py-12 flex justify-center w-full" role="status" aria-live="polite">
          <LoadingSpinner text={t("list.loadingInitial")} />
        </Box>
      )}

      {!isInitialLoad && !loading && drivers.length === 0 && (
        <Typography
          variant="body1"
          role="status"
          aria-live="polite"
          /* POPRAWKA: Wymuszenie !font-sans dla komunikatu o braku kierowców */
          className="text-center py-12 font-medium !font-sans"
          sx={{ color: 'var(--color-brand-text-muted)' }}
        >
          {t("list.noDrivers")}
        </Typography>
      )}

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
            /* POPRAWKA: Przypisanie ujednoliconego tokenu !text-btn-mono z wagą czcionki kontrolowaną klasą v4 */
            className="!text-btn-mono uppercase tracking-widest font-black"
            style={{ color: 'var(--color-brand-text-muted)', opacity: 0.5 }}
          >
            {t("list.terminalReached")}
          </span>
        )}
      </div>

      {/* STRZAŁKA PRZYPIĘTA NA STAŁE DO DOŁU EKRANU */}
      {shouldShowArrow && (
        <Box className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <ScrollArrow
            direction="down"
            className="!p-2"
            visible={shouldShowArrow}
            text={t("list.loadMore")}
          />
        </Box>
      )}
    </TableContainer>
  );
}