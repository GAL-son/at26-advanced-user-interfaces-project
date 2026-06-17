"use client";

import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Button, Alert } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfiniteEventList from "@/app/_components/Events/InfiniteEventList";
import EventRowSkeleton from "@/app/_components/Events/EventRowSkeleton";
import UniversalSearch from "@/app/_components/UniversalSearch";
import { useTranslations } from "next-intl";
import { focusFlatSection } from "@/app/_utils/navigation";
import { usePageInitialFocus } from "../_hooks/usePageInitialFocus";
import { RaceEvent } from "../_components/Events/EventRow";
const SECTION_ORDER = ["menu", "events-header", "events-list", "footer"];

export default function EventsPage() {
  const t = useTranslations("Events");
  usePageInitialFocus();

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

  const handleHeaderKeyDown = (e: React.KeyboardEvent, element: "search" | "refresh") => {
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
      className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300 bg-[var(--color-brand-navy)] text-[var(--color-brand-text)]"
    >
      <Container component="main" maxWidth="lg" className="p-0!">
        {/* SEKCJA NAGŁÓWKA */}
        <Box
          component="header"
          data-section="events-header"
          className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          {/* POPRAWKA: Dodane !font-display dla aktywacji Orbitrona */}
          <Typography
            component="h1"
            className="!text-page-title !font-display font-black tracking-tight uppercase shrink-0 !text-[var(--color-brand-text)]"
          >
            {t("title")}
          </Typography>

          <Box className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-full md:max-w-xl flex-1 justify-end">

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
                data-section-page-start="true"
                data-focus-order="primary"
                results={[]}
                onSelectResult={() => { }}
              />
            </Box>

            {/* POPRAWKA: Wpięcie klasy focus-brand i zabezpieczenie !text-btn-mono */}
            <Button
              id="events-refresh-btn"
              variant="outlined"
              size="medium"
              onClick={() => loadInitialData(true)}
              onKeyDown={(e) => handleHeaderKeyDown(e, "refresh")}
              disabled={loading || refreshing}
              startIcon={<RefreshIcon />}
              aria-label={refreshing ? t("buttons.refreshingAria") : t("buttons.refreshAria")}
              className="!text-btn-mono focus-brand uppercase px-5 py-3 h-12 rounded-[var(--radius-brand-card)] whitespace-nowrap transition-all duration-200
                !text-[var(--color-brand-text-muted)] !border-[var(--color-brand-navy-light)] bg-[color-mix(in_srgb,var(--color-brand-navy-dark)_40%,transparent)]
                hover:!border-[var(--color-brand-yellow-hover)] hover:!text-[var(--color-brand-yellow-text)] hover:bg-[color-mix(in_srgb,var(--color-brand-yellow)_8%,transparent)]
                disabled:!text-[color-mix(in_srgb,var(--color-brand-text-muted)_40%,transparent)] disabled:!border-[var(--color-brand-navy-light)]"
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
            /* POPRAWKA: Wymuszenie czcionki podstawowej !font-sans dla komunikatu o błędzie */
            <Alert
              severity="error"
              role="alert"
              className="mb-6 font-medium !font-sans"
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