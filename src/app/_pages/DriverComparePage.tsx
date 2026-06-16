"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Box, Typography } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";

// Import komponentów dedykowanych i globalnych
import DriverSearchContainer from "@/app/_components/Elo/DriverSearchContainer";
import BackButton from "@/app/_components/Common/BackButton"; // Zakładam taką ścieżkę do Twojego nowego komponentu

import LoadingSpinner from "@/app/_components/LoadingSpinner";
import EloChart from "@/app/_components/Elo/EloChart";
import { DriverBasicInfo } from "@/app/_components/Elo/SelectedDriverList";
import { useTranslations } from "next-intl";
import { focusFlatSection } from "@/app/_utils/navigation";

const SECTION_ORDER = [
  "menu",
  "compare-back",
  "compare-search",
  "compare-chart"
];

function CompareDriversContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("CompareDrivers");

  const [selectedDrivers, setSelectedDrivers] = useState<DriverBasicInfo[]>([]);

  const backButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let active = true;
    const guidsParam = searchParams.get("guids");

    if (!guidsParam) {
      setSelectedDrivers([]);
      return;
    }

    const guids = guidsParam.split(",").filter(Boolean);

    async function fetchInitialDrivers() {
      try {
        const promises = guids.map(async (guid) => {
          const res = await fetch(`/api/drivers/${guid}`);
          const data = await res.json();
          if (data.success && data.driver) {
            return {
              guid: data.driver.guid,
              mainName: data.driver.mainName,
              currentElo: data.driver.currentElo,
            };
          }
          return { guid, mainName: `${t("driverFallback")} (${guid.substring(0, 5)})` };
        });

        const drivers = await Promise.all(promises);

        if (active) {
          setSelectedDrivers(drivers);
        }
      } catch (err) {
        console.error("Error fetching initial drivers for comparison:", err);
      }
    }

    fetchInitialDrivers();

    return () => {
      active = false;
    };
  }, [searchParams, t]);

  const updateUrlParams = (drivers: DriverBasicInfo[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (drivers.length > 0) {
      const guids = drivers.map((d) => d.guid).join(",");
      params.set("guids", guids);
    } else {
      params.delete("guids");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleAddDriver = (driver: DriverBasicInfo) => {
    if (selectedDrivers.some((d) => d.guid === driver.guid)) return;

    const updated = [...selectedDrivers, driver];
    setSelectedDrivers(updated);
    updateUrlParams(updated);
  };

  const handleRemoveDriver = (guidToRemove: string) => {
    const updated = selectedDrivers.filter((d) => d.guid !== guidToRemove);
    setSelectedDrivers(updated);
    updateUrlParams(updated);
  };

  const selectedGuids = selectedDrivers.map((d) => d.guid);

  return (
    <Box
      className="min-h-screen py-10 px-4 sm:px-6 lg:px-8"
      sx={{
        backgroundColor: 'var(--color-brand-navy)',
        color: 'var(--color-brand-text)',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      <div className="container mx-auto max-w-5xl">

        {/* SEKCJA: Przycisk Powrotu (Wdrożony nowy komponent) */}
        <div
          data-section="compare-back"
          data-section-page-start="true"
          className="flex items-center gap-4 mb-8"
        >
          <BackButton
            ref={backButtonRef}
            ariaLabel={t("backButtonAria")}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                const searchInput = document.getElementById("driver-search-input");
                if (searchInput) {
                  searchInput.focus();
                } else {
                  focusFlatSection("compare-back", "next", SECTION_ORDER);
                }
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                focusFlatSection("compare-back", "prev", SECTION_ORDER);
              }
            }}
          />
          <div>
            <Typography
              component="h1"
              className="text-3xl font-black uppercase tracking-tight leading-tight flex items-center gap-3"
              sx={{ color: 'var(--color-brand-text)' }}
            >
              <GroupIcon fontSize="large" sx={{ color: 'var(--color-brand-yellow-hover)' }} />{" "}
              {t("title")}
            </Typography>
            <Typography
              variant="caption"
              component="p"
              className="text-xs mt-1"
              sx={{ color: 'var(--color-brand-text-muted)' }}
            >
              {t("subtitle")}
            </Typography>
          </div>
        </div>

        {/* SEKCJA: Wyszukiwarka i panel kontrolny */}
        <div data-section="compare-search" className="grid grid-cols-1 gap-6 mb-8">
          <DriverSearchContainer
            selectedDrivers={selectedDrivers}
            onAddDriver={handleAddDriver}
            onRemoveDriver={handleRemoveDriver}
            onNavigateVertical={(dir) =>
              focusFlatSection("compare-search", dir === "up" ? "prev" : "next", SECTION_ORDER)
            }
          />
        </div>

        {/* SEKCJA: Wykres ELO / Stan Pusty */}
        <div data-section="compare-chart">
          {selectedGuids.length === 0 ? (
            <Box
              className="h-64 flex flex-col items-center justify-center p-6 text-center"
              sx={{
                border: '2px dashed var(--color-brand-navy-light)',
                borderRadius: 'var(--radius-brand-card)',
                backgroundColor: 'color-mix(in srgb, var(--color-brand-navy-dark) 40%, transparent)',
              }}
            >
              <Typography
                component="p"
                className="text-sm font-mono font-bold tracking-wider"
                sx={{ color: 'var(--color-brand-text-muted)' }}
              >
                {t("emptyState.title")}
              </Typography>
              <Typography
                component="p"
                className="text-xs mt-1 opacity-70"
                sx={{ color: 'var(--color-brand-text-muted)' }}
              >
                {t("emptyState.description")}
              </Typography>
            </Box>
          ) : (
            <EloChart
              data-focus-order="compare-chart" // <-- Dzięki temu funkcja focusFlatSection znajdzie ten element
              guids={selectedGuids}
              isComparable={false}
              onNavigateVertical={(direction) => {
                // Wywołanie globalnego systemu przełączania sekcji (w górę do wyszukiwarki, w dół do kolejnej sekcji)
                focusFlatSection("compare-chart", direction === "up" ? "prev" : "next", SECTION_ORDER);
              }}
            />
          )}
        </div>

      </div>
    </Box>
  );
}

export default function CompareDriversPage() {
  const t = useTranslations("CompareDrivers");

  return (
    <Suspense
      fallback={
        <Box
          className="min-h-screen flex flex-col items-center justify-center gap-3"
          sx={{ backgroundColor: 'var(--color-brand-navy)' }}
        >
          <LoadingSpinner
            text={t("loadingText")}
            size={20}
            className="py-2 px-4"
          />
        </Box>
      }
    >
      <CompareDriversContent />
    </Suspense>
  );
}