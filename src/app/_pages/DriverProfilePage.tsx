"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Paper, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import BackButton from "@/app/_components/Common/BackButton";
import LoadingSpinner from "@/app/_components/LoadingSpinner";
import EloChart from "@/app/_components/Elo/EloChart";
import { useTranslations, useFormatter } from "next-intl";
import { focusFlatSection } from "@/app/_utils/navigation";

interface DriverStats {
  guid: string;
  mainName: string;
  altNames: string | null;
  combo: number;
  currentElo: number;
  racesCount: number;
  lastRaced: string;
}

// Definicja kolejności sekcji dla tej konkretnej strony
const SECTION_ORDER = [
  "menu",
  "driver-back",
  "driver-chart"
];

export default function DriverProfilePage() {
  const { guid } = useParams() as { guid: string };
  const router = useRouter();
  const t = useTranslations("Drivers");
  const format = useFormatter();

  const [driver, setDriver] = useState<DriverStats | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const backButtonRef = useRef<HTMLButtonElement | null>(null);
  const chartSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchDriverProfile() {
      try {
        const res = await fetch(`/api/drivers/${guid}`);
        const data = await res.json();
        if (data.success) {
          setDriver(data.driver);
        }
      } catch (err) {
        console.error("Error fetching driver profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchDriverProfile();
  }, [guid]);

  // Globalny przechwytywacz strzałek w lewo/prawo do aktywacji wykresu
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

  // EKRAN ŁADOWANIA WSTĘPNEGO
  if (loadingProfile) {
    return (
      <Box 
        component="div"
        role="status"
        aria-live="polite"
        className="min-h-screen flex flex-col items-center justify-center gap-3"
        sx={{ backgroundColor: 'var(--color-brand-navy)' }}
      >
        <LoadingSpinner text={t("profile.loadingTelemetry")} size={20} className="py-2 px-4" />
      </Box>
    );
  }

  // BŁĄD POŁĄCZENIA
  if (!driver) {
    return (
      <Box 
        role="alert"
        className="min-h-screen flex items-center justify-center font-mono text-sm"
        sx={{ backgroundColor: 'var(--color-brand-navy)', color: 'var(--color-brand-text-muted)' }}
      >
        {t("profile.connectionError")}
      </Box>
    );
  }

  // Zlokalizowany format daty i czasu synchronizacji
  const hasValidDate = driver.lastRaced && driver.lastRaced !== "N/A";
  const formattedSyncDate = hasValidDate
    ? format.dateTime(new Date(driver.lastRaced), {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : t("list.notAvailable");

  return (
    <Box 
      component="main"
      id="main-content"
      className="min-h-screen py-10 px-4 sm:px-6 lg:px-8"
      sx={{
        backgroundColor: 'var(--color-brand-navy)',
        color: 'var(--color-brand-text)',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      <div className="container mx-auto max-w-5xl">
        
        {/* SEKCJA: Przycisk powrotu */}
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
              className="text-3xl font-black uppercase tracking-tight leading-tight"
              style={{ color: 'var(--color-brand-text)' }}
            >
              {driver.mainName}
            </h1>
            {driver.altNames && driver.altNames !== driver.mainName && (
              <p 
                className="text-xs mt-1"
                style={{ color: 'var(--color-brand-text-muted)', opacity: 0.7 }}
              >
                {t("list.aliases")}: {driver.altNames}
              </p>
            )}
          </div>
        </div>

        {/* STATYSTYKI - KARTY HUD */}
        <section aria-label={t("profile.statsSummary")}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            
            {/* KARTA 1: CURRENT ELO */}
            <Paper 
              component="article" 
              className="p-5 flex items-center gap-4 shadow-sm" 
              sx={{ 
                backgroundImage: 'none',
                backgroundColor: 'var(--color-brand-navy-dark)',
                border: '1px solid var(--color-brand-navy-light)',
                borderRadius: 'var(--radius-brand-card)'
              }}
            >
              <Box 
                className="p-3 rounded-lg flex-shrink-0"
                aria-hidden="true"
                sx={{ 
                  backgroundColor: 'color-mix(in srgb, var(--color-brand-yellow-hover) 12%, transparent)',
                  color: 'var(--color-brand-yellow-hover)'
                }}
              >
                <TrendingUpIcon fontSize="large" />
              </Box>
              <div>
                <Typography 
                  variant="caption"
                  component="h2"
                  className="text-[10px] font-mono uppercase tracking-widest font-bold block"
                  sx={{ color: 'var(--color-brand-text-muted)', opacity: 0.7 }}
                >
                  {t("list.headers.elo")}
                </Typography>
                <p 
                  className="text-2xl font-black font-mono"
                  style={{ color: 'var(--color-brand-text)' }}
                >
                  {format.number(Math.round(driver.currentElo || 0))}
                </p>
              </div>
            </Paper>

            {/* KARTA 2: TOTAL EXPERIENCE */}
            <Paper 
              component="article" 
              className="p-5 flex items-center gap-4 shadow-sm" 
              sx={{ 
                backgroundImage: 'none',
                backgroundColor: 'var(--color-brand-navy-dark)',
                border: '1px solid var(--color-brand-navy-light)',
                borderRadius: 'var(--radius-brand-card)'
              }}
            >
              <Box 
                className="p-3 rounded-lg flex-shrink-0"
                aria-hidden="true"
                sx={{ 
                  backgroundColor: 'color-mix(in srgb, var(--color-brand-text) 6%, transparent)',
                  color: 'var(--color-brand-text-muted)'
                }}
              >
                <SportsScoreIcon fontSize="large" />
              </Box>
              <div>
                <Typography 
                  variant="caption"
                  component="h2"
                  className="text-[10px] font-mono uppercase tracking-widest font-bold block"
                  sx={{ color: 'var(--color-brand-text-muted)', opacity: 0.7 }}
                >
                  {t("profile.totalExperience")}
                </Typography>
                <p 
                  className="text-2xl font-black font-mono"
                  style={{ color: 'var(--color-brand-text)' }}
                >
                  {format.number(driver.racesCount)}{" "}
                  <span className="text-xs font-normal" style={{ color: 'var(--color-brand-text-muted)' }}>
                    {t("profile.racesUnit")}
                  </span>
                </p>
              </div>
            </Paper>

            {/* KARTA 3: LAST ONLINE SYNC */}
            <Paper 
              component="article" 
              className="p-5 flex items-center gap-4 shadow-sm" 
              sx={{ 
                backgroundImage: 'none',
                backgroundColor: 'var(--color-brand-navy-dark)',
                border: '1px solid var(--color-brand-navy-light)',
                borderRadius: 'var(--radius-brand-card)'
              }}
            >
              <Box 
                className="p-3 rounded-lg flex-shrink-0"
                aria-hidden="true"
                sx={{ 
                  backgroundColor: 'var(--color-brand-navy-light)',
                  color: 'var(--color-brand-text-muted)'
                }}
              >
                <EventAvailableIcon fontSize="large" />
              </Box>
              <div>
                <Typography 
                  variant="caption"
                  component="h2"
                  className="text-[10px] font-mono uppercase tracking-widest font-bold block"
                  sx={{ color: 'var(--color-brand-text-muted)', opacity: 0.7 }}
                >
                  {t("profile.lastSync")}
                </Typography>
                <h3 
                  className="text-sm font-bold mt-1"
                  style={{ color: 'var(--color-brand-text)' }}
                >
                  {formattedSyncDate}
                </h3>
              </div>
            </Paper>
          </div>
        </section>

        {/* SEKCJA: Wykres ELO */}
        <div data-section="driver-chart" ref={chartSectionRef}>
          <EloChart 
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