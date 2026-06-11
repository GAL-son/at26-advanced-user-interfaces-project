"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography, Alert } from "@mui/material";
import EventRow from "./EventRow";
import EventRowSkeleton from "./EventRowSkeleton";

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
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialNextCursor,
  );
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Zamknięcie funkcji w useCallback zapobiega re-kreacji przy każdym renderze
  const loadMoreEvents = useCallback(async () => {
    if (loadingMore || !nextCursor) return;

    try {
      setLoadingMore(true);
      setError(null);

      const res = await fetch(`/api/events?limit=10&cursor=${nextCursor}`);
      if (!res.ok)
        throw new Error("Failed to load more race events.");

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
  }, [nextCursor, loadingMore]);

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
      { rootMargin: "100px" },
    );

    observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [nextCursor, loadMoreEvents]);

  // Stan pusty (Brak wyścigów)
  if (events.length === 0) {
    return (
      <Typography
        variant="body1"
        className="!text-brand-muted text-center py-8 font-medium"
      >
        No races found in the database. Please run synchronization.
      </Typography>
    );
  }

  return (
    <Box>
      {/* Semantyczna lista wyścigów */}
      <Box
        component="ul"
        aria-label="Simracing race events list"
        sx={{ listStyle: "none", p: 0, m: 0 }}
      >
        {events.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </Box>

      {/* Obsługa błędu doczytywania */}
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

      {/* Kontener loadera / końca listy */}
      <Box
        ref={loaderRef}
        className="mt-4"
        aria-live="polite"
        aria-busy={loadingMore}
      >
        {loadingMore && (
          <Box component="div" aria-label="Loading more race events">
            <EventRowSkeleton count={2} />
          </Box>
        )}

        {!nextCursor && !loadingMore && (
          <Typography
            variant="body2"
            className="!text-brand-muted/50 text-center py-6 font-mono text-xs uppercase tracking-widest font-bold"
          >
            You have reached the end of the grid.
          </Typography>
        )}
      </Box>
    </Box>
  );
}