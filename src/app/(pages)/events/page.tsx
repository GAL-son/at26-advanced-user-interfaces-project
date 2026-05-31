"use client";
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  Divider,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfiniteEventList from "./InfiniteEventList";
import EventRowSkeleton from "./EventRowSkeleton";

interface RaceEvent {
  id: string;
  server: string;
  track: string;
  date: string;
  jsonUrl: string;
}

export default function EventsPage() {
  const [initialData, setInitialData] = useState<{
    data: RaceEvent[];
    nextCursor: string | null;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setLoading(true);
      }
      setError(null);
      // Pobieramy 25 elementów na start
      const res = await fetch("/api/events?limit=25");
      if (!res.ok) throw new Error("Nie udało się pobrać danych z bazy.");

      const json = await res.json();

      if (json.success) {
        setInitialData({
          data: json.data || [],
          nextCursor: json.nextCursor,
        });
      } else {
        throw new Error(json.error || "Wystąpił nieoczekiwany błąd danych.");
      }
    } catch (err: any) {
      setError(err.message || "Błąd połączenia z API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData(false);
  }, []);

  return (
    <Container component="main" maxWidth="md" sx={{ py: 5 }}>
      {/* Sekcja Nagłówka */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            Zarządzanie Wynikami ACSM
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Przeglądaj zsynchronizowane wyścigi, szczegółowe rezultaty sesji oraz zmiany ELO.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="inherit" // Bardziej minimalistyczny, surowy wygląd pasujący do reszty ramek
          size="medium"
          onClick={() => loadInitialData(true)} // Bezpieczne wywołanie z flagą true
          disabled={loading}
          startIcon={<RefreshIcon />}
          aria-label="Odśwież listę wyścigów"
          sx={{
            borderColor: "divider",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 1.5,
            px: 2,
            py: 0.75,
            "&:hover": {
              borderColor: "text.primary",
              backgroundColor: "action.hover",
            },
          }}
        >
          Odśwież
        </Button>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Stan ładowania początkowego – Renderujemy dokładnie 25 skeletonów */}
      {loading && (
        <Box aria-label="Pobieranie początkowej listy wyścigów">
          <EventRowSkeleton count={25} />
        </Box>
      )}

      {/* Stan błędu */}
      {error && (
        <Alert 
          severity="error" 
          role="alert"
          sx={{ 
            mb: 4, 
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: "error.light",
            bgcolor: "error.lighter" 
          }}
        >
          {error}
        </Alert>
      )}

      {/* Wyświetlenie asynchronicznej listy po załadowaniu danych */}
      {!loading && !error && initialData && (
        <InfiniteEventList
          initialEvents={initialData.data}
          initialNextCursor={initialData.nextCursor}
        />
      )}
    </Container>
  );
}