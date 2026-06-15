"use client";

import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Button, Alert } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfiniteEventList from "@/app/_components/Events/InfiniteEventList";
import EventRowSkeleton from "@/app/_components/Events/EventRowSkeleton";
import UniversalSearch from "@/app/_components/UniversalSearch";
import { useTranslations } from "next-intl";
import { focusFlatSection } from "@/app/_utils/navigation";

interface RaceEvent {
  id: string;
  server: string;
  track: string;
  date: string;
  jsonUrl: string;
}

const SECTION_ORDER = ["menu", "events-header", "events-list"];

export default function EventsPage() {
  const t = useTranslations("Events");

  const [initialData, setInitialData] = useState<{
    data: RaceEvent[];
    nextCursor: string | null;
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const loadInitialData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const res = await fetch("/api/events?limit=24");
      if (!res.ok) throw new Error(t("errors.fetchFailed"));

      const json = await res.json();

      if (json.success) {
        setInitialData({
          data: json.data || [],
          nextCursor: json.nextCursor,
        });
      } else {
        throw new Error(json.error || t("errors.unexpected"));
      }
    } catch (err: any) {
      setError(err.message || t("errors.connection"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInitialData(false);
  }, []);

  // Obsługa nawigacji wewnątrz nagłówka (wyszukiwarka <-> przycisk odświeżania)
  const handleHeaderKeyDown = (e: React.KeyboardEvent, element: "search" | "refresh") => {
    // Jeśli lista podpowiedzi w wyszukiwarce jest aktywna i użytkownik klika strzałki góra/dół,
    // pozwól wyszukiwarce obsłużyć wybór elementu z dropdownu i nie zmieniaj sekcji.
    const target = e.target as HTMLElement;
    const isComboboxExpanded = target.getAttribute("aria-expanded") === "true";

    if (element === "search" && isComboboxExpanded && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      return;
    }

    if (e.key === "ArrowRight" && element === "search") {
      e.preventDefault();
      document.getElementById("events-refresh-btn")?.focus();
    } else if (e.key === "ArrowLeft" && element === "refresh") {
      e.preventDefault();
      // Szukamy bezpośredniego inputu wewnątrz kontenera wyszukiwarki
      const searchInput = document.getElementById("events-search-container")?.querySelector("input");
      if (searchInput) {
        (searchInput as HTMLInputElement).focus();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      focusFlatSection("events-header", "down", SECTION_ORDER);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusFlatSection("events-header", "up", SECTION_ORDER);
    }
  };

  return (
    <Box
      component="div"
      className="min-h-screen py-10 px-4 sm:px-6 lg:px-8"
      sx={{
        backgroundColor: 'var(--color-brand-navy)',
        color: 'var(--color-brand-text)',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      <Container component="main" maxWidth="lg" className="p-0!">
        {/* SEKCJA NAGŁÓWKA */}
        <Box
          component="header"
          data-section="events-header"
          className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <Typography
            variant="h4"
            component="h1"
            className="tracking-tight uppercase text-2xl sm:text-3xl shrink-0"
            sx={{ color: 'var(--color-brand-text)', fontWeight: 900 }}
          >
            {t("title")}
          </Typography>

          {/* 🟢 POPRAWKA 1: Zamiana md:w-auto na md:w-full dla odblokowania przestrzeni */}
          <Box className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-full md:max-w-xl flex-1 justify-end">

            {/* 🟢 POPRAWKA 2: Dodanie sm:flex-1 oraz md:max-w-full */}
            <Box
              id="events-search-container"
              className="w-full sm:flex-1 md:max-w-full"
              onKeyDown={(e) => handleHeaderKeyDown(e, "search")}
            >
              <UniversalSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t("searchPlaceholder")}
                label={t("searchLabel")}
                isLoading={loading || refreshing}
                data-focus-order="primary"
              />
            </Box>

            <Button
              id="events-refresh-btn"
              variant="outlined"
              size="medium"
              onClick={() => loadInitialData(true)}
              onKeyDown={(e) => handleHeaderKeyDown(e, "refresh")}
              disabled={loading || refreshing}
              startIcon={<RefreshIcon />}
              aria-label={refreshing ? t("buttons.refreshingAria") : t("buttons.refreshAria")}
              sx={{
                transition: "all 0.2s ease",
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: 700,
                px: 2.5,
                py: 1.5,
                height: "48px", // 🟢 Dopasowanie wysokości idealnie pod input wyszukiwarki (który ma height: 48px w sx)
                borderRadius: "var(--radius-brand-card)",
                whiteSpace: "nowrap",
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
              {refreshing ? t("buttons.refreshing") : t("buttons.refresh")}
            </Button>
          </Box>
        </Box>

        {/* GŁÓWNA STRUKTURA DANYCH */}
        <Box
          id="events-feed-container"
          data-section="events-list"
          aria-live="polite"
          aria-busy={loading || refreshing}
        >
          {loading && (
            <Box aria-label={t("loadingAria")}>
              <EventRowSkeleton count={12} />
            </Box>
          )}

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

          {!loading && !error && initialData && (
            <Box className={refreshing ? "opacity-50 pointer-events-none transition-opacity duration-200" : "transition-opacity duration-200"}>
              <InfiniteEventList
                initialEvents={initialData.data}
                initialNextCursor={initialData.nextCursor}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                pageSections={SECTION_ORDER}
              />
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}