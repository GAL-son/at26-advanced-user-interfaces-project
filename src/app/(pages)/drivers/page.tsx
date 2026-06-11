"use client";
import React, { useState, useEffect, useRef } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography } from "@mui/material";
import DriverFilterBar, { SortOption } from "./DriverFilterBar";
import DriverRow, { FormattedDriver } from "./DriverRow";
import LoadingSpinner from "@/app/_components/LoadingSpinner";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<FormattedDriver[]>([]);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('elo');
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  // Nowy stan określający, czy to pierwsze ładowanie strony/filtrów
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Debouncing wyszukiwarki (czekamy 300ms po skończeniu pisania)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset tabeli przy zmianie filtrów lub karty sortowania
  useEffect(() => {
    setDrivers([]);
    setPage(0);
    setHasMore(true);
    setIsInitialLoad(true); // Przy zmianie filtrów traktujemy to znów jako "initial load" dla nowego zestawu danych
  }, [debouncedSearch, sortBy]);

  // Pobieranie danych z zaktualizowanego API
  useEffect(() => {
    async function fetchDrivers() {
      // Jeśli nie ma więcej danych lub już trwa ładowanie, przerywamy
      // Wyjątek: pozwalamy przejść jeśli drivers jest puste (reset na page=0)
      if ((!hasMore && page !== 0) || loading) return;
      setLoading(true);

      try {
        const res = await fetch(
          `/api/drivers?page=${page}&limit=20&search=${encodeURIComponent(debouncedSearch)}&sortBy=${sortBy}`
        );
        const data = await res.json();

        if (data.success && data.drivers) {
          const mappedDrivers: FormattedDriver[] = data.drivers.map((d: any) => ({
            guid: d.guid,
            mainName: d.mainName,
            altNames: d.altNames,
            position: d.position,
            racesCount: d.racesCount,
            combo: d.combo,
            currentElo: d.currentElo || 0,
            lastRaced: d.lastRaced || "N/A"
          }));

          setDrivers(prev => (page === 0 ? mappedDrivers : [...prev, ...mappedDrivers]));
          setHasMore(data.hasMore);
        }
      } catch (err) {
        console.error("Error fetching drivers leaderboard:", err);
      } finally {
        setLoading(false);
        setIsInitialLoad(false); // Pierwsze zapytanie (lub zapytanie po resecie filtrów) się zakończyło
      }
    }
    fetchDrivers();
  }, [page, debouncedSearch, sortBy]);

  // IntersectionObserver dla płynnego Infinite Scroll
  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      entries => {
        // Nie triggerujemy kolejnej strony, jeśli wciąż trwa pierwsze ładowanie komponentu
        if (entries[0].isIntersecting && hasMore && !loading && !isInitialLoad) {
          setPage(prev => prev + 1);
        }
      },
      { rootMargin: "150px" }
    );

    observer.observe(currentTarget);
    return () => observer.disconnect();
  }, [hasMore, loading, isInitialLoad]);

  const headerClass = "!text-brand-muted/70 !font-bold text-xs uppercase tracking-wider py-3 border-b border-brand-navy-light";

  return (
    <Box className="min-h-screen bg-brand-navy py-10 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="container mx-auto max-w-5xl">

        {/* TYTUŁ SEKCYJNY HUD */}
        <h1 className="text-3xl !font-black uppercase tracking-tight !text-brand-muted mb-6">
          Driver Standings
        </h1>

        {/* ZUNIFIKOWANY PASEK FILTROWANIA (4 TABSY + SZUKAJ) */}
        <DriverFilterBar
          search={search}
          setSearch={setSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* GŁÓWNA TABELA RANKINGOWA */}
        <TableContainer
          component={Paper}
          sx={{ backgroundImage: 'none', backgroundColor: 'transparent' }}
          className="bg-brand-navy-dark border border-brand-navy-light rounded-xl shadow-xl overflow-hidden"
        >
          <Table aria-label="Drivers global standings">
            <TableHead className="bg-brand-navy/60">
              <TableRow>
                <TableCell align="center" className={`${headerClass} w-16`}>Pos</TableCell>
                <TableCell className={headerClass}>Driver Profile</TableCell>

                <TableCell
                  align="center"
                  className={`${headerClass} w-36 ${sortBy === 'races' ? '!text-brand-yellow font-black' : ''}`}
                >
                  Races
                </TableCell>

                <TableCell
                  align="center"
                  className={`${headerClass} w-44 ${sortBy === 'lastRaced' ? '!text-brand-yellow font-black' : ''}`}
                >
                  Last Active
                </TableCell>

                <TableCell
                  align="right"
                  className={`${headerClass} w-36 ${sortBy === 'elo' ? '!text-brand-yellow font-black' : ''}`}
                >
                  ELO Rating
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.map((driver) => (
                <DriverRow key={driver.guid} driver={driver} />
              ))}
            </TableBody>
          </Table>

          {/* 1. INITIAL LOADER (Gdy strona startuje lub filtry się resetują i czekamy na pierwszy feedback z API) */}
          {isInitialLoad && (
            <Box className="py-12 flex justify-center w-full">
              <LoadingSpinner text={"Loading drivers leaderboard..."} />
            </Box>
          )}

          {/* 2. PUSTY STAN (Wyświetla się TYLKO, gdy ładowanie się zakończyło, a baza danych zwróciła 0 wyników) */}
          {!isInitialLoad && !loading && drivers.length === 0 && (
            <Typography
              variant="body1"
              className="!text-brand-muted text-center py-12 font-medium"
            >
              No drivers found matching this combination.
            </Typography>
          )}

          {/* Loader na samym dole tabeli dla Infinite Scroll (używany tylko przy kolejnych stronach) */}
          <div
            ref={observerTarget}
            className="w-full py-6 flex justify-center bg-brand-navy/20 border-t border-brand-navy-light/40"
          >
            {/* Ten spinner pokaże się tylko przy pobieraniu stron 1, 2, 3... */}
            {loading && !isInitialLoad && (
              <LoadingSpinner text={"Loading more drivers..."} />
            )}
            {!hasMore && drivers.length > 0 && (
              <span className="text-[10px] !text-brand-muted/40 font-mono uppercase tracking-widest font-black">
                Grid terminal reached
              </span>
            )}
          </div>
        </TableContainer>
      </div>
    </Box>
  );
}