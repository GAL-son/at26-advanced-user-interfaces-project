"use client";

import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography, useMediaQuery, useTheme } from "@mui/material";
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
  const [isMounted, setIsMounted] = useState(false);
  const theme = useTheme();
  
  // Detekcja ekranu mobilnego (poniżej 768px)
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
      <Table aria-label="Drivers global standings">
        {/* Nagłówek ukrywa się całkowicie na mobile */}
        <TableHead 
          sx={{ 
            display: isMounted && isMobile ? 'none' : 'table-header-group',
            backgroundColor: 'color-mix(in srgb, var(--color-brand-text) 3%, var(--color-brand-navy-dark))',
            '& .MuiTableCell-head': {
              color: 'var(--color-brand-text-muted)',
              borderBottom: '1px solid var(--color-brand-navy-light)'
            }
          }}
        >
          <TableRow>
            <TableCell align="center" className={`${headerClass} w-16`}>Pos</TableCell>
            <TableCell className={headerClass}>Driver Profile</TableCell>
            
            <TableCell
              align="center"
              className={`${headerClass} w-36`}
              sx={{
                color: sortBy === 'races' ? 'var(--color-brand-yellow-text) !important' : 'inherit',
                fontWeight: sortBy === 'races' ? '900 !important' : 'inherit'
              }}
            >
              Races
            </TableCell>

            <TableCell
              align="center"
              className={`${headerClass} w-44`}
              sx={{
                color: sortBy === 'lastRaced' ? 'var(--color-brand-yellow-text) !important' : 'inherit',
                fontWeight: sortBy === 'lastRaced' ? '900 !important' : 'inherit'
              }}
            >
              Last Active
            </TableCell>

            <TableCell
              align="right"
              className={`${headerClass} w-36`}
              sx={{
                color: sortBy === 'elo' ? 'var(--color-brand-yellow-text) !important' : 'inherit',
                fontWeight: sortBy === 'elo' ? '900 !important' : 'inherit'
              }}
            >
              ELO Rating
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
        <Box className="py-12 flex justify-center w-full">
          <LoadingSpinner text={"Loading drivers leaderboard..."} />
        </Box>
      )}

      {/* PUSTY STAN */}
      {!isInitialLoad && !loading && drivers.length === 0 && (
        <Typography
          variant="body1"
          className="text-center py-12 font-medium"
          sx={{ color: 'var(--color-brand-text-muted)' }}
        >
          No drivers found matching this combination.
        </Typography>
      )}

      {/* BOTTOM LOADER DLA INFINITE SCROLL */}
      <Box
        ref={observerTargetRef}
        className="w-full py-6 flex justify-center"
        sx={{ 
          backgroundColor: 'color-mix(in srgb, var(--color-brand-text) 1.5%, transparent)',
          borderTop: '1px solid var(--color-brand-navy-light)'
        }}
      >
        {loading && !isInitialLoad && (
          <LoadingSpinner text={"Loading more drivers..."} />
        )}
        {!hasMore && drivers.length > 0 && (
          <span 
            className="text-[10px] font-mono uppercase tracking-widest font-black"
            style={{ color: 'var(--color-brand-text-muted)', opacity: 0.5 }}
          >
            Grid terminal reached
          </span>
        )}
      </Box>
    </TableContainer>
  );
}