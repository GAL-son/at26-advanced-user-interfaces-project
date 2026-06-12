"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography, Alert } from "@mui/material";
import EventRow from "./EventRow";
import EventRowSkeleton from "./EventRowSkeleton";
import UniversalSearch from "@/app/_components/UniversalSearch";

interface RaceEvent {
  id: string;
  server: string;
  track: string;
  date: string;
  jsonUrl: string;
}

interface InfiniteEventListProps {
  initialEvents: RaceEvent[];
  initialNextCursor: string | null;
}

export default function InfiniteEventList({
  initialEvents,
  initialNextCursor,
}: InfiniteEventListProps) {
  const [events, setEvents] = useState<RaceEvent[]>(initialEvents);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Stany dla wyszukiwarki
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Dynamiczna liczba skeletonów dostosowana do wiersza siatki
  const [skeletonCount, setSkeletonCount] = useState<number>(3);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Monitorowanie wielkości ekranu i dopasowanie liczby skeletonów do breakpointów Tailwinda
  useEffect(() => {
    const mdQuery = window.matchMedia("(min-width: 768px)"); // md:grid-cols-3
    const smQuery = window.matchMedia("(min-width: 640px)"); // sm:grid-cols-2

    const updateSkeletonCount = () => {
      if (mdQuery.matches) {
        setSkeletonCount(3);
      } else if (smQuery.matches) {
        setSkeletonCount(2);
      } else {
        setSkeletonCount(1);
      }
    };

    // Wywołanie na starcie po stronie klienta
    updateSkeletonCount();

    // Reakcja na zmianę szerokości ekranu
    mdQuery.addEventListener("change", updateSkeletonCount);
    smQuery.addEventListener("change", updateSkeletonCount);

    return () => {
      mdQuery.removeEventListener("change", updateSkeletonCount);
      smQuery.removeEventListener("change", updateSkeletonCount);
    };
  }, []);

  // Debouncing dla wyszukiwarki (opóźnienie zapytania API o 400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Efekt reagujący na zmianę szukanej frazy
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
        if (!res.ok) throw new Error("Failed to search race events.");

        const json = await res.json();
        if (json.success && json.data) {
          setEvents(json.data);
          setNextCursor(json.nextCursor);
        } else {
          throw new Error(json.error || "API data structure error.");
        }
      } catch (err: any) {
        setError(err.message || "Network connection error.");
        setEvents([]);
      } finally {
        setLoadingMore(false);
      }
    };

    fetchFilteredEvents();
  }, [debouncedSearch, initialEvents, initialNextCursor]);

  // Funkcja ładowania kolejnych paczek (Infinite Scroll)
  const loadMoreEvents = useCallback(async () => {
    if (loadingMore || !nextCursor) return;

    try {
      setLoadingMore(true);
      setError(null);

      const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : "";
      const res = await fetch(`/api/events?limit=12&cursor=${nextCursor}${searchParam}`);
      
      if (!res.ok) throw new Error("Failed to load more race events.");

      const json = await res.json();

      if (json.success && json.data) {
        setEvents((prev) => [...prev, ...json.data]);
        setNextCursor(json.nextCursor);
      } else {
        throw new Error(json.error || "API data structure error.");
      }
    } catch (err: any) {
      setError(err.message || "Network connection error.");
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, debouncedSearch]);

  // Konfiguracja Intersection Observer do wykrywania końca listy
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

  return (
    <Box className="space-y-6">
      {/* Sekcja wyszukiwarki */}
      <Box className="max-w-md mx-auto sm:mx-0">
        <UniversalSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search tracks or servers..."
          label="Filter Races"
          isLoading={loadingMore && events.length === 0}
        />
      </Box>

      {/* Stan pusty */}
      {events.length === 0 && !loadingMore ? (
        <Typography
          variant="body1"
          className="!text-brand-muted text-center py-12 font-medium"
        >
          No races found matching your criteria.
        </Typography>
      ) : (
        <Box
          component="ul"
          aria-label="Simracing race events grid"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          sx={{ listStyle: "none", p: 0, m: 0 }}
        >
          {events.map((event) => (
            <Box component="li" key={event.id} className="h-full">
              <EventRow event={event} />
            </Box>
          ))}
        </Box>
      )}

      {error && (
        <Alert 
          severity="error" 
          role="alert"
          className="mt-4 !bg-elo-loss/10 !text-elo-loss border border-elo-loss/20 font-medium rounded-xl"
          sx={{ '& .MuiAlert-icon': { color: 'var(--color-elo-loss)' } }}
        >
          {error}
        </Alert>
      )}

      {/* Kontener loadera */}
      <Box
        ref={loaderRef}
        className="mt-4"
        aria-live="polite"
        aria-busy={loadingMore}
      >
        {loadingMore && (
          <Box component="div" aria-label="Loading more race events">
            {/* Dynamiczna liczba dopasowana do szerokości ekranu */}
            <EventRowSkeleton count={skeletonCount} />
          </Box>
        )}

        {!nextCursor && !loadingMore && events.length > 0 && (
          <Typography
            variant="body2"
            className="!text-brand-muted/50 text-center py-8 font-mono text-xs uppercase tracking-widest font-bold"
          >
            You have reached the end of the grid.
          </Typography>
        )}
      </Box>
    </Box>
  );
}