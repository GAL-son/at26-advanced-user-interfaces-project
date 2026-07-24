"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { focusFlatSection } from "@/app/_utils/navigation";
import BackButton from "@/components/common/BackButton";
import PageLoaderWrapper from "@/app/_components/Common/PageLoaderWrapper";
import RatingChart from "@/features/ratings/components/RatingChart";

import { DriverDetailsDto } from "../drivers.types";
import { getDriverDetailsAction } from "../drivers.actions";
import DriverStatsCards from "../components/profile/DriverStatsCards";

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

  useEffect(() => {
    if (driver?.mainName) {
      document.title = `${t("profile.metaTitle") || "Profil"} - ${driver.mainName}`;
    } else if (loadingProfile) {
      document.title = t("profile.loadingTelemetry");
    } else {
      document.title = t("profile.connectionError");
    }
  }, [driver, loadingProfile, t]);

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
      <div 
        role="status"
        aria-live="polite"
        className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[var(--color-brand-navy)]"
      >
        <div className="animate-pulse text-sm uppercase tracking-wider text-center text-[var(--color-brand-text-muted)]">
          {t("profile.loadingTelemetry")}
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div 
        role="alert"
        className="min-h-screen flex items-center justify-center text-btn-mono uppercase bg-[var(--color-brand-navy)] text-[var(--color-brand-text-muted)]"
      >
        {t("profile.connectionError")}
      </div>
    );
  }

  return (
    <main 
      id="main-content"
      className="pt-10 pb-4 px-4 sm:px-6 lg:px-8 bg-[var(--color-brand-navy)] text-[var(--color-brand-text)] transition-colors duration-300 ease-in-out"
    >
      <div className="container mx-auto max-w-5xl">
        <div 
          data-section="driver-back"
          data-section-page-start="true"
          className="flex items-center gap-4 mb-8"
        >
          <BackButton 
            ref={backButtonRef}
            ariaLabel={t("profile.backToLeaderboard")} 
            sectionName="driver-back"
            sectionOrder={SECTION_ORDER}
          />
        </div>

        {/* KOMPONENT KART STATYSTYK */}
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
    </main>
  );
}

export default function DriverProfileView() {
  const t = useTranslations("Drivers");

  return (
    <PageLoaderWrapper loadingText={t("profile.loadingTelemetry")}>
      <DriverProfileContent />
    </PageLoaderWrapper>
  );
}