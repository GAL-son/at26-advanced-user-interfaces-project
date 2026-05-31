"use client";
import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Alert, Skeleton } from "@mui/material";
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

  // Referencja do elementu na dole strony, który będziemy obserwować
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadMoreEvents = async () => {
    if (loadingMore || !nextCursor) return;

    try {
      setLoadingMore(true);
      setError(null);

      const res = await fetch(`/api/events?limit=10&cursor=${nextCursor}`);
      if (!res.ok)
        throw new Error("Nie udało się załadować kolejnych wyścigów.");

      const json = await res.json();

      if (json.success && json.data) {
        setEvents((prev) => [...prev, ...json.data]);
        setNextCursor(json.nextCursor);
      } else {
        throw new Error(json.error || "Błąd struktury danych API.");
      }
    } catch (err: any) {
      setError(err.message || "Błąd połączenia sieciowego.");
    } finally {
      setLoadingMore(false);
    }
  };

  // Konfiguracja Intersection Observer do wykrywania scrollowania do dołu
  useEffect(() => {
    const currentLoader = loaderRef.current;
    if (!currentLoader || !nextCursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Jeśli element dolny jest widoczny w 10% na ekranie, ładuj dane
        if (entries[0].isIntersecting) {
          loadMoreEvents();
        }
      },
      { rootMargin: "100px" }, // Zapobiegawcze ładowanie 100px przed końcem ekranu
    );

    observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [nextCursor, loadingMore]); // Reagujemy na zmianę kursora

  if (events.length === 0) {
    return (
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ textAlign: "center", py: 4 }}
      >
        Brak wyścigów w bazie danych. Uruchom synchronizację.
      </Typography>
    );
  }
  return (
    <Box>
      {/* Semantyczna lista zgodna z WCAG */}
      <Box
        component="ul"
        aria-label="Lista wyścigów samochodowych"
        sx={{ listStyle: "none", p: 0, m: 0 }}
      >
        {events.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </Box>

      {/* Obsługa błędu doczytywania */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} role="alert">
          {error}
        </Alert>
      )}

      <Box
        ref={loaderRef}
        sx={{ mt: 1 }}
        aria-live="polite"
        aria-busy={loadingMore} // WCAG: informuje czytniki, że ta sekcja się aktualizuje
      >
        {loadingMore && (
          <Box component="div" aria-label="Ładowanie kolejnych wyścigów">
            <EventRowSkeleton count={3} />
          </Box>
        )}

        {!nextCursor && !loadingMore && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 3 }}
          >
            To już wszystkie zsynchronizowane wyścigi.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
