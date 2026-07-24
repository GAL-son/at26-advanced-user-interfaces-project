"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Box } from "@mui/material";
import BackButton from "@/app/_components/Common/BackButton";

import { useTranslations } from "next-intl";
import { focusFlatSection } from "@/app/_utils/navigation";

// Importy nowych typów i akcji
import { DriverDetailsDto } from "@/lib/services/drivers.service";
import { getDriverDetailsAction } from "@/actions/drivers.actions"; // Dostosuj ścieżkę do akcji
import DriverStatsCards from "@/app/_components/Drivers/Profile/DriverStatsCards"; // Dostosuj ścieżkę do komponentu kart
import PageLoaderWrapper from "@/app/_components/Common/PageLoaderWrapper";
import RatingChart from "../_components/Rating/RatingChart";

const SECTION_ORDER = [
  "menu",
  "driver-back",
  "driver-chart",
  "footer"
];

function DriverProfileContent() {
  const { guid } = useParams() as { guid: string };
  const t = useTranslations("Drivers");

  const [driver, setDriver] = useState<DriverDetailsDto | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const backButtonRef = useRef<HTMLButtonElement | null>(null);
  const chartSectionRef = useRef<HTMLDivElement | null>(null);

  // Pobieranie danych kierowcy za pomocą Akcji Serwerowej
  useEffect(() => {
    async function fetchDriverProfile() {
      try {
        const data = await getDriverDetailsAction(guid);
        setDriver(data);
      } catch (err) {
        console.error("Error fetching driver profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchDriverProfile();
  }, [guid]);

  // Dynamiczny tytuł karty w przeglądarce
  useEffect(() => {
    if (driver?.mainName) {
      document.title = `${t("profile.metaTitle") || "Profil"} - ${driver.mainName}`;
    } else if (loadingProfile) {
      document.title = t("profile.loadingTelemetry");
    } else {
      document.title = t("profile.connectionError");
    }
  }, [driver, loadingProfile, t]);

  // Nawigacja klawiaturą dla wykresu
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const activeEl = document.activeElement;
        if (activeEl?.tagName === "INPUT" || activeEl?.tagName === "TEXTAREA") {
          return;
        }

        const chartInteractiveZone = chartSectionRef.current?.querySelector('[tabindex="0"]') as HTMLElement;
        
        if (chartInteractiveZone && document.activeElement !== chartInteractiveZone) {
          chartInteractiveZone.focus();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  if (loadingProfile) {
    return (
      <Box 
        component="div"
        role="status"
        aria-live="polite"
        className="min-h-screen flex flex-col items-center justify-center gap-3"
        sx={{ backgroundColor: 'var(--color-brand-navy)' }}
      >
        <div className="animate-pulse text-sm uppercase tracking-wider text-center" style={{ color: 'var(--color-brand-text-muted)' }}>
          {t("profile.loadingTelemetry")}
        </div>
      </Box>
    );
  }

  if (!driver) {
    return (
      <Box 
        role="alert"
        className="min-h-screen flex items-center justify-center !text-btn-mono uppercase"
        sx={{ backgroundColor: 'var(--color-brand-navy)', color: 'var(--color-brand-text-muted)' }}
      >
        {t("profile.connectionError")}
      </Box>
    );
  }

  return (
    <Box 
      component="main"
      id="main-content"
      className="pt-10 pb-4 px-4 sm:px-6 lg:px-8"
      sx={{
        backgroundColor: 'var(--color-brand-navy)',
        color: 'var(--color-brand-text)',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      <div className="container mx-auto max-w-5xl">
        
        {/* SEKCJA: Przycisk powrotu + Nagłówek */}
        <div 
          data-section="driver-back"
          data-section-page-start="true"
          className="flex items-center gap-4 mb-8"
        >
          <BackButton 
            ref={backButtonRef}
            ariaLabel={t("profile.backToLeaderboard")} 
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                focusFlatSection("driver-back", "next", SECTION_ORDER);
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                focusFlatSection("driver-back", "prev", SECTION_ORDER);
              }
            }}
          />
          <div>
            <h1 
              className="!text-page-title uppercase leading-tight shrink-0"
              style={{ color: 'var(--color-brand-text)' }}
            >
              {driver.mainName}
            </h1>
            {driver.altNames && driver.altNames !== driver.mainName && (
              <p 
                className="!text-btn-mono mt-1 uppercase"
                style={{ color: 'var(--color-brand-text-muted)', opacity: 0.7 }}
              >
                {t("list.aliases")}: {driver.altNames}
              </p>
            )}
          </div>
        </div>

        {/* UŻYCIE TWOJEGO NOWEGO KOMPONENTU KART */}
        <DriverStatsCards driver={driver} />

        {/* SEKCJA: Wykres ELO */}
        <div data-section="driver-chart" ref={chartSectionRef}>
          <RatingChart 
            data-focus-order="driver-chart"
            guids={[guid]} 
            isComparable={true} 
            onNavigateVertical={(direction) => {
              focusFlatSection("driver-chart", direction === "up" ? "prev" : "next", SECTION_ORDER);
            }}
          />
        </div>
      </div>
    </Box>
  );
}

// Główny wrapper komponentu
export default function DriverProfilePage() {
  const t = useTranslations("Drivers");

  return (
    <PageLoaderWrapper loadingText={t("profile.loadingTelemetry")}>
      <DriverProfileContent />
    </PageLoaderWrapper>
  );
}