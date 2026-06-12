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
      
      // Limit zmieniony na 24 (podzielne przez 1, 2 i 3 kolumny)
      const res = await fetch("/api/events?limit=24");
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
    <Box 
      className="min-h-screen py-10 px-4 sm:px-6 lg:px-8"
      sx={{
        backgroundColor: 'var(--color-brand-navy)',
        color: 'var(--color-brand-text)',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      {/* Zmiana maxWidth z "md" na "lg" zapewnia optymalną szerokość dla 3 kolumn kafelków */}
      <Container component="main" maxWidth="lg" className="p-0!">
        
        {/* SEKCJA NAGŁÓWKA */}
        <Box
          className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <Box className="space-y-1">
            <Typography 
              variant="h4" 
              component="h1" 
              className="tracking-tight uppercase text-2xl sm:text-3xl"
              sx={{ color: 'var(--color-brand-text)', fontWeight: 900 }}
            >
              ACSM Event Manager
            </Typography>
            <Typography 
              variant="body2" 
              className="font-medium"
              sx={{ color: 'var(--color-brand-text-muted)', opacity: 0.8 }}
            >
              Browse synchronized races, detailed session outcomes, and dynamic ELO rating changes.
            </Typography>
          </Box>

          {/* PRZYCISK ODŚWIEŻANIA */}
          <Button
            variant="outlined"
            size="medium"
            onClick={() => loadInitialData(true)}
            disabled={loading}
            startIcon={<RefreshIcon />}
            aria-label="Refresh race events list"
            sx={{
              textTransform: "none",
              transition: "all 0.2s ease",
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 700,
              px: 2,
              py: 1,
              borderRadius: "var(--radius-brand-card)",
              
              color: 'var(--color-brand-text-muted)',
              borderColor: 'var(--color-brand-navy-light)',
              backgroundColor: 'color-mix(in srgb, var(--color-brand-navy-dark) 40%, transparent)',

              '&:hover': {
                borderColor: 'var(--color-brand-yellow-hover)',
                color: 'var(--color-brand-yellow-text)',
                backgroundColor: 'color-mix(in srgb, var(--color-brand-yellow) 8%, transparent)',
              },
              '&:disabled': {
                color: 'color-mix(in srgb, var(--color-brand-text-muted) 40%, transparent)',
                borderColor: 'var(--color-brand-navy-light)',
              }
            }}
          >
            Refresh
          </Button>
        </Box>

        <Divider sx={{ borderColor: 'var(--color-brand-navy-light)', mb: 4 }} />

        {/* STAN ŁADOWANIA POCZĄTKOWEGO */}
        {loading && (
          <Box aria-label="Fetching initial race events list">
            {/* Hrabia skeletonów ustawiony na 12 (pełne wiersze dla siatki 1, 2 i 3 kolumnowej) */}
            <EventRowSkeleton count={12} /> 
          </Box>
        )}

        {/* STAN BŁĘDU */}
        {error && (
          <Alert 
            severity="error" 
            role="alert"
            className="mb-6 font-medium"
            sx={{ 
              borderRadius: 'var(--radius-brand-card)',
              backgroundColor: 'color-mix(in srgb, var(--color-elo-loss) 10%, transparent)',
              color: 'var(--color-elo-loss)',
              border: '1px solid color-mix(in srgb, var(--color-elo-loss) 20%, transparent)',
              '& .MuiAlert-icon': { color: 'var(--color-elo-loss)' } 
            }}
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