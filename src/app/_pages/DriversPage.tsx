"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { useTranslations } from "next-intl";
import DriverFilterBar, { SortOption } from "@/app/_components/Drivers/DriverFilterBar";
import DriverList from "@/app/_components/Drivers/DriverList";
import { FormattedDriver } from "@/app/_components/Drivers/DriverRow";
import { focusFlatSection } from "@/app/_utils/navigation";
import { usePageInitialFocus } from "../_hooks/usePageInitialFocus"; // NOWOŚĆ: Import hooka

const SECTION_ORDER = ["menu", "drivers-filters", "drivers-list"];

export default function DriversPage() {
  const t = useTranslations("Drivers");

  // NOWOŚĆ: Aktywacja automatycznego zarządzania focusem po wejściu na stronę
  usePageInitialFocus();

  const [drivers, setDrivers] = useState<FormattedDriver[]>([]);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('elo');
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [srAnnouncement, setSrAnnouncement] = useState("");

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

          if (page === 0) {
            if (mappedDrivers.length === 0) {
              setSrAnnouncement(t("list.noDrivers"));
            } else {
              setSrAnnouncement(t("sr.resultsFound", { count: data.drivers.length }));
            }
          } else {
            setSrAnnouncement(t("sr.loadedMore", { total: drivers.length + mappedDrivers.length }));
          }
        }
      } catch (err) {
        console.error("Error fetching drivers leaderboard:", err);
        setSrAnnouncement(t("sr.errorLoading"));
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
    fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, sortBy, t]);

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
      component="main"
      id="main-content"
      className="min-h-screen py-10 px-4 sm:px-6 lg:px-8"
      sx={{
        backgroundColor: 'var(--color-brand-navy)',
        color: 'var(--color-brand-text)',
      }}
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {srAnnouncement}
      </div>

      <div className="container mx-auto max-w-5xl">
        <h1 className="!text-page-title uppercase mb-6" style={{ color: 'var(--color-brand-text)' }}>
          {t("title")}
        </h1>

        {/* NOWOŚĆ: Dodany atrybut data-section-page-start="true". 
          Hook znajdzie ten kontener i przekaże focus do pierwszego interaktywnego elementu wewnątrz (np. inputu wyszukiwarki).
        */}
        <div
          data-section="drivers-filters"
          data-section-page-start="true"
          className="w-full"
        >
          <DriverFilterBar
            search={search}
            setSearch={setSearch}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onNavigateVertical={(dir) => focusFlatSection("drivers-filters", dir, SECTION_ORDER)}
          />
        </div>

        <div data-section="drivers-list" className="w-full mt-4">
          <DriverList
            drivers={drivers}
            loading={loading}
            isInitialLoad={isInitialLoad}
            hasMore={hasMore}
            sortBy={sortBy}
            observerTargetRef={observerTarget}
            onNavigateVertical={(dir) => focusFlatSection("drivers-list", dir, SECTION_ORDER)}
            loadMoreDrivers={() => setPage(prev => prev + 1)}
          />
        </div>
      </div>
    </Box>
  );
}