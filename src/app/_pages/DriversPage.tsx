"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import DriverFilterBar, { SortOption } from "@/app/_components/Drivers/DriverFilterBar";
import DriverList from "@/app/_components/Drivers/DriverList";
import { FormattedDriver } from "@/app/_components/Drivers/DriverRow";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<FormattedDriver[]>([]);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('elo');
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setDrivers([]);
    setPage(0);
    setHasMore(true);
    setIsInitialLoad(true);
  }, [debouncedSearch, sortBy]);

  useEffect(() => {
    async function fetchDrivers() {
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
        setIsInitialLoad(false);
      }
    }
    fetchDrivers();
  }, [page, debouncedSearch, sortBy]);

  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !isInitialLoad) {
          setPage(prev => prev + 1);
        }
      },
      { rootMargin: "150px" }
    );

    observer.observe(currentTarget);
    return () => observer.disconnect();
  }, [hasMore, loading, isInitialLoad]);

  return (
    <Box 
      className="min-h-screen py-10 px-4 sm:px-6 lg:px-8"
      sx={{
        backgroundColor: 'var(--color-brand-navy)',
        color: 'var(--color-brand-text)',
      }}
    >
      <div className="container mx-auto max-w-5xl">

        <h1 className="text-3xl font-black uppercase tracking-tight mb-6" style={{ color: 'var(--color-brand-text)' }}>
          Driver Standings
        </h1>

        <DriverFilterBar
          search={search}
          setSearch={setSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* NOWY WYDZIELONY KOMPONENT LISTY */}
        <DriverList 
          drivers={drivers}
          loading={loading}
          isInitialLoad={isInitialLoad}
          hasMore={hasMore}
          sortBy={sortBy}
          observerTargetRef={observerTarget}
        />

      </div>
    </Box>
  );
}