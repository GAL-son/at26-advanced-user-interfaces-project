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
import InfiniteEventList from "@/app/_components/Events/InfiniteEventList";
import EventRowSkeleton from "@/app/_components/Events/EventRowSkeleton";

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
      
      const res = await fetch("/api/events?limit=25");
      if (!res.ok) throw new Error("Failed to fetch events from the database.");

      const json = await res.json();

      if (json.success) {
        setInitialData({
          data: json.data || [],
          nextCursor: json.nextCursor,
        });
      } else {
        throw new Error(json.error || "An unexpected data error occurred.");
      }
    } catch (err: any) {
      setError(err.message || "API connection error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData(false);
  }, []);

  return (
    // Główny wrapper wymuszający ciemne/jasne tło na poziomie całej podstrony
    <Box className="min-h-screen bg-brand-navy py-10 px-4 sm:px-6 lg:px-8 text-slate-100">
      <Container component="main" maxWidth="md" className="p-0!">
        
        {/* SEKCJA NAGŁÓWKA */}
        <Box
          className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <Box className="space-y-1">
            <Typography 
              variant="h4" 
              component="h1" 
              className="!text-brand-muted !font-black tracking-tight uppercase text-2xl sm:text-3xl"
            >
              ACSM Event Manager
            </Typography>
            <Typography variant="body2" className="!text-brand-muted/70 font-medium">
              Browse synchronized races, detailed session outcomes, and dynamic ELO rating changes.
            </Typography>
          </Box>

          {/* PRZYCISK ODŚWIEŻANIA W STYLU HUD */}
          <Button
            variant="outlined"
            size="medium"
            onClick={() => loadInitialData(true)}
            disabled={loading}
            startIcon={<RefreshIcon />}
            aria-label="Refresh race events list"
            sx={{
              textTransform: "none",
              transition: "all 0.15s ease",
            }}
            className="!text-brand-muted !border-brand-navy-light hover:!border-brand-yellow hover:!text-brand-yellow !font-mono text-xs uppercase tracking-wider !font-bold !px-4 !py-2 rounded-xl bg-brand-navy-dark/40"
          >
            Refresh
          </Button>
        </Box>

        <Divider className="!border-brand-navy-light/60 mb-8" />

        {/* STAN ŁADOWANIA POCZĄTKOWEGO */}
        {loading && (
          <Box aria-label="Fetching initial race events list">
            <EventRowSkeleton count={8} /> 
            {/* Zmniejszono z 25 na 8 dla lepszego UX wizualnego, unikania przeładowania DOM szkieletami */}
          </Box>
        )}

        {/* STAN BŁĘDU */}
        {error && (
          <Alert 
            severity="error" 
            role="alert"
            className="mb-6 !bg-elo-loss/10 !text-elo-loss border border-elo-loss/20 font-medium rounded-xl"
            sx={{ '& .MuiAlert-icon': { color: 'var(--color-elo-loss)' } }}
          >
            {error}
          </Alert>
        )}

        {/* WYŚWIETLENIE LISTY PO ZAŁADOWANIU */}
        {!loading && !error && initialData && (
          <InfiniteEventList
            initialEvents={initialData.data}
            initialNextCursor={initialData.nextCursor}
          />
        )}
      </Container>
    </Box>
  );
}