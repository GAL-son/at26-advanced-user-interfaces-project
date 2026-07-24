"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { focusFlatSection } from "@/app/_utils/navigation";
import BackButton from "@/components/common/BackButton";
import PageLoaderWrapper from "@/app/_components/Common/PageLoaderWrapper";

import { getEventDetailsAction } from "../events.actions";
import { EventDetailsDto } from "../events.types";
import EventHeaderInfo from "../components/EventHeaderInfo";
import EventSummaryTable from "../components/EventSummaryTable";
import EventSessionsTabs from "../components/sessions/EventSessionsTabs";

const PAGE_SECTION_ORDER = [
  "menu",
  "back-action",
  "race-info",
  "summary-table",
  "sessions-tabs",
  "footer",
];

function EventViewContent() {
  const t = useTranslations("Results");
  const params = useParams();
  const id = params?.id as string;

  const [eventData, setEventData] = useState<EventDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let active = true;

    async function fetchEventDetails() {
      try {
        const data = await getEventDetailsAction(id);
        if (active) {
          setEventData(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading race data via action:", err);
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchEventDetails();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (eventData?.name) {
      document.title = `${t("metaTitle")} - ${eventData.name}`;
    } else if (loading) {
      document.title = t("metaLoading");
    } else {
      document.title = t("metaNotFound");
    }
  }, [eventData, loading, t]);

  const handleSectionNavigation = (currentSection: string, direction: "up" | "down") => {
    focusFlatSection(currentSection, direction, PAGE_SECTION_ORDER);
  };

  // STAN ŁADOWANIA
  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-brand-navy)]"
      >
        <div className="animate-pulse text-sm uppercase tracking-wider text-[var(--color-brand-text-muted)]">
          {t("metaLoading")}
        </div>
      </div>
    );
  }

  // STAN BŁĘDU / BRAKU DANYCH
  if (!eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-brand-navy)] text-[var(--color-brand-text)]">
        <div className="max-w-md w-full p-8 text-center shadow-xl border border-[color-mix(in_srgb,var(--color-brand-navy-light)_40%,transparent)] rounded-[var(--radius-brand-card)] bg-[var(--color-brand-navy-dark)] flex flex-col items-center gap-4">
          <h2 className="font-bold text-[var(--color-elo-loss)] text-lg">
            {t("notFoundMessage")}
          </h2>

          <BackButton fallbackHref="/events" ariaLabel={t("backButton")} />
        </div>
      </div>
    );
  }

  // WŁAŚCIWY LAYOUT STRONY
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-[var(--color-brand-navy)] text-[var(--color-brand-text)]">
      <main className="container mx-auto max-w-5xl space-y-6">

        {/* SEKCJA PRZYCISKU POWROTU */}
        <div
          data-section="back-action"
          className="mb-4 flex items-center gap-3 outline-none"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              handleSectionNavigation("back-action", "down");
            }
          }}
        >
          <BackButton
            fallbackHref="/events"
            ariaLabel={t("backButton")}
            tabIndex={0}
            data-focus-order="primary"
            data-section-page-start="true"
          />

          <span
            aria-hidden="true"
            className="!text-btn-mono uppercase select-none text-xs text-[var(--color-brand-text-muted)]"
          >
            {t("backButton")}
          </span>
        </div>

        {/* SEKCJA 1: Informacje o wyścigu i serwerze */}
        <div data-section="race-info" className="outline-none">
          <EventHeaderInfo
            event={eventData}
            onNavigateVertical={(direction) => handleSectionNavigation("race-info", direction)}
          />
        </div>

        {/* SEKCJA 2: Zbiorcza tabela wyników kierowców i zmian punktów ELO */}
        <div data-section="summary-table" className="outline-none">
          <EventSummaryTable results={eventData.results} />
        </div>

        {/* SEKCJA 3: Szczegółowe widoki sesji (Kwalifikacje, Wyścigi, Czasy) */}
        <div data-section="sessions-tabs" className="outline-none">
          <EventSessionsTabs sessions={eventData.sessions} />
        </div>

      </main>
    </div>
  );
}

export default function EventView() {
  const t = useTranslations("Results");

  return (
    <PageLoaderWrapper loadingText={t("metaLoading")}>
      <EventViewContent />
    </PageLoaderWrapper>
  );
}