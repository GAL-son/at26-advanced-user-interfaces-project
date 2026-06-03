"use client";
import React, { useState, useEffect, useRef } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box, Typography } from "@mui/material";
import DriverFilterBar, { SortOption } from "./DriverFilterBar";
import DriverRow, { FormattedDriver } from "./DriverRow";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<FormattedDriver[]>([]);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('elo');
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Debouncing wyszukiwarki (czekamy 300ms po skończeniu pisania)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset tabeli i powrót na pierwszą stronę przy zmianie filtrów lub karty sortowania
  useEffect(() => {
    setDrivers([]);
    setPage(0);
    setHasMore(true);
  }, [debouncedSearch, sortBy]);

  // Pobieranie danych z zaktualizowanego API
  useEffect(() => {
  async function fetchDrivers() {
    if (!hasMore || loading) return;
    setLoading(true);

    try {
      // 🟢 KLUCZOWE: Przekazujemy dynamiczny parametr &sortBy=${sortBy} do endpointu
      const res = await fetch(
        `/api/drivers?page=${page}&limit=20&search=${encodeURIComponent(debouncedSearch)}&sortBy=${sortBy}`
      );
      const data = await res.json();

      if (data.success) {
        setDrivers(prev => (page === 0 ? data.drivers : [...prev, ...data.drivers]));
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error("Error fetching drivers leaderboard:", err);
    } finally {
      setLoading(false);
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
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { rootMargin: "150px" } // Załaduj kolejną paczkę zanim użytkownik przewinie do samego dołu
    );
    
    observer.observe(currentTarget);
    return () => observer.disconnect();
  }, [hasMore, loading]);

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

        {/* GLÓWNA TABELA RANKINGOWA */}
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
                
                {/* Dynamiczne podświetlenie kolumny aktywnego sortowania */}
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
                // Przekazujemy klucz guid, a pozycją zarządza już sam wiersz z obiektu driver.position
                <DriverRow key={driver.guid} driver={driver}/>
              ))}
            </TableBody>
          </Table>

          {/* Stan pusty (brak pasujących kierowców) */}
          {drivers.length === 0 && !loading && (
            <Typography 
              variant="body1" 
              className="!text-brand-muted text-center py-12 font-medium"
            >
              No drivers found matching this combination.
            </Typography>
          )}

          {/* Loader na samym dole tabeli */}
          <div 
            ref={observerTarget} 
            className="w-full py-6 flex justify-center bg-brand-navy/20 border-t border-brand-navy-light/40"
          >
            {loading && (
              <div className="flex items-center gap-3 !text-brand-yellow font-mono text-xs uppercase tracking-wider font-bold">
                <CircularProgress size={16} sx={{ color: 'var(--color-brand-yellow)' }} />
                Loading standings extension...
              </div>
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