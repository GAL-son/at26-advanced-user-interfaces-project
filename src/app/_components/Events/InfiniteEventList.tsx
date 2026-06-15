"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography, Alert } from "@mui/material";
import EventRow from "./EventRow";
import EventRowSkeleton from "./EventRowSkeleton";
import { useTranslations } from "next-intl";
import { focusFlatSection } from "@/app/_utils/navigation";

interface RaceEvent {
  id: string;
  server: string;
  track: string;
  date: string;
  name: string;
}

interface InfiniteEventListProps {
  initialEvents: RaceEvent[];
  initialNextCursor: string | null;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  pageSections: string[];
}

export default function InfiniteEventList({
  initialEvents,
  initialNextCursor,
  searchQuery,
  pageSections,
}: InfiniteEventListProps) {
  const t = useTranslations("Events");

  const [events, setEvents] = useState<RaceEvent[]>(initialEvents);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [skeletonCount, setSkeletonCount] = useState<number>(3);
  
  // KLUCZOWE: Dynamiczne śledzenie liczby kolumn siatki dla nawigacji klawiszowej
  const [columnsCount, setColumnsCount] = useState<number>(3);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const mdQuery = window.matchMedia("(min-width: 768px)");
    const smQuery = window.matchMedia("(min-width: 640px)");

    const updateLayoutMetrics = () => {
      if (mdQuery.matches) {
        setSkeletonCount(3);
        setColumnsCount(3); // md -> grid-cols-3
      } else if (smQuery.matches) {
        setSkeletonCount(2);
        setColumnsCount(2); // sm -> grid-cols-2
      } else {
        setSkeletonCount(1);
        setColumnsCount(1); // mobile -> grid-cols-1
      }
    };

    updateLayoutMetrics();
    mdQuery.addEventListener("change", updateLayoutMetrics);
    smQuery.addEventListener("change", updateLayoutMetrics);

    return () => {
      mdQuery.removeEventListener("change", updateLayoutMetrics);
      smQuery.removeEventListener("change", updateLayoutMetrics);
    };
  }, []);

  useEffect(() => {
  const currentGrid = gridRef.current;
  if (!currentGrid) return;

  const updateColumns = () => {
    // Pobieramy wyliczone style siatki z przeglądarki
    const computedStyle = window.getComputedStyle(currentGrid);
    const gridTemplateColumns = computedStyle.getPropertyValue("grid-template-columns");

    // gridTemplateColumns zwraca wartości oddzielone spacją dla każdej kolumny, np. "300px 300px"
    const currentColumns = gridTemplateColumns.split(" ").filter(Boolean).length;

    if (currentColumns > 0) {
      setColumnsCount(currentColumns);
      setSkeletonCount(currentColumns);
    }
  };

  // Obserwujemy zmiany rozmiaru elementu ul
  const resizeObserver = new ResizeObserver(() => {
    updateColumns();
  });

  resizeObserver.observe(currentGrid);
  
  // Pierwsze wywołanie na start
  updateColumns();

  return () => {
    resizeObserver.disconnect();
  };
}, []);

  // Debouncing frazy wyszukiwania
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Pobieranie przefiltrowanych danych
  useEffect(() => {
    if (debouncedSearch.trim() === "") {
      setEvents(initialEvents);
      setNextCursor(initialNextCursor);
      setError(null);
      return;
    }

    const fetchFilteredEvents = async () => {
      setLoadingMore(true);
      setError(null);
      try {
        const res = await fetch(`/api/events?limit=12&search=${encodeURIComponent(debouncedSearch)}`);
        if (!res.ok) throw new Error(t("errors.searchFailed"));

        const json = await res.json();
        if (json.success && json.data) {
          setEvents(json.data);
          setNextCursor(json.nextCursor);
        } else {
          throw new Error(json.error || t("errors.unexpected"));
        }
      } catch (err: any) {
        setError(err.message || t("errors.connection"));
        setEvents([]);
      } finally {
        setLoadingMore(false);
      }
    };

    const fetchHandler = setTimeout(() => {
      fetchFilteredEvents();
    }, 50);

    return () => clearTimeout(fetchHandler);
  }, [debouncedSearch, initialEvents, initialNextCursor, t]);

  // Pobieranie kolejnych stron (Infinite Scroll)
  const loadMoreEvents = useCallback(async () => {
    if (loadingMore || !nextCursor) return;

    try {
      setLoadingMore(true);
      setError(null);

      const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : "";
      const res = await fetch(`/api/events?limit=12&cursor=${nextCursor}${searchParam}`);
      
      if (!res.ok) throw new Error(t("errors.loadMoreFailed"));

      const json = await res.json();

      if (json.success && json.data) {
        setEvents((prev) => [...prev, ...json.data]);
        setNextCursor(json.nextCursor);
      } else {
        throw new Error(json.error || t("errors.unexpected"));
      }
    } catch (err: any) {
      setError(err.message || t("errors.connection"));
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, debouncedSearch, t]);

  // Konfiguracja Intersection Observer
  useEffect(() => {
    const currentLoader = loaderRef.current;
    if (!currentLoader || !nextCursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreEvents();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [nextCursor, loadMoreEvents]);

  // --- INTELIGENTNY MANEDŻER NAWIGACJI SIATKI 2D ---
  const handleGridKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let targetIndex = -1;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        if (currentIndex < events.length - 1) {
          targetIndex = currentIndex + 1;
        }
        break;

      case "ArrowLeft":
        e.preventDefault();
        if (currentIndex > 0) {
          targetIndex = currentIndex - 1;
        } else {
          // Jeśli jesteśmy na zerowym elemencie i klikamy w lewo -> powrót do wyszukiwarki
          focusFlatSection("events-list", "up", pageSections);
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        // Dynamiczny skok o wyliczoną szerokość kolumny (1, 2 lub 3)
        if (currentIndex + columnsCount < events.length) {
          targetIndex = currentIndex + columnsCount;
        } else if (nextCursor) {
          // Jesteśmy na ostatniej linii, ale są jeszcze dane na serwerze -> wywołaj doładowanie
          loadMoreEvents();
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (currentIndex - columnsCount >= 0) {
          targetIndex = currentIndex - columnsCount;
        } else {
          // Próba wyjścia w górę ponad pierwszy rząd owocuje przeniesieniem na nagłówek
          focusFlatSection("events-list", "up", pageSections);
        }
        break;

      default:
        return; // Zostaw klawisze funkcyjne (np. Enter) w spokoju
    }

    // Jeśli wyznaczono poprawny indeks, przenieś focus
    if (targetIndex !== -1) {
      const targetElement = document.getElementById(`event-card-${events[targetIndex].id}`);
      targetElement?.focus();
    }
  };

  return (
    <Box className="space-y-6">
      
      {/* STAN PUSTY */}
      {events.length === 0 && !loadingMore ? (
        <Typography
          variant="body1"
          role="status"
          className="text-center py-12 font-medium text-[var(--color-brand-text-muted)]"
        >
          {t("list.emptyState")}
        </Typography>
      ) : (
        <Box
          ref={gridRef}
          component="ul"
          aria-label={t("list.gridAria")}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          sx={{ listStyle: "none", p: 0, m: 0 }}
        >
          {events.map((event, index) => (
            <Box 
              component="li" 
              key={event.id} 
              className="h-full"
              onKeyDown={(e) => handleGridKeyDown(e, index)}
            >
              {/* Przekazujemy unikalny identyfikator DOM do spięcia fokusu */}
              <EventRow 
                id={`event-card-${event.id}`} 
                event={event} 
                tabIndex={0}
              />
            </Box>
          ))}
        </Box>
      )}

      {error && (
        <Alert 
          severity="error" 
          role="alert"
          className="mt-4 font-medium rounded-xl border border-[color-mix(in_srgb,var(--color-elo-loss)_20%,transparent)]"
          sx={{ 
            backgroundColor: 'color-mix(in srgb, var(--color-elo-loss) 10%, transparent)',
            color: 'var(--color-loss)',
            '& .MuiAlert-icon': { color: 'var(--color-elo-loss)' } 
          }}
        >
          {error}
        </Alert>
      )}

      <Box
        ref={loaderRef}
        className="mt-4"
        aria-live="polite"
        aria-busy={loadingMore}
      >
        {loadingMore && (
          <Box component="div" aria-label={t("list.loadingMoreAria")}>
            <EventRowSkeleton count={skeletonCount} />
          </Box>
        )}

        {!nextCursor && !loadingMore && events.length > 0 && (
          <Typography
            variant="body2"
            role="status"
            className="text-center py-8 font-mono text-xs uppercase tracking-widest font-bold text-[var(--color-brand-text-muted)] opacity-50"
          >
            {t("list.endOfGrid")}
          </Typography>
        )}
      </Box>
    </Box>
  );
}