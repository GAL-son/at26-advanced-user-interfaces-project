"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { focusFlatSection } from "@/app/_utils/navigation";
import PageLoaderWrapper from "@/app/_components/Common/PageLoaderWrapper";
import BackButton from "@/app/_components/Common/BackButton";
import RatingChart from "@/features/ratings/components/RatingChart";


import { getDriversBasicInfoAction } from "../drivers.actions";
import { DriverBasicDto } from "../drivers.types";
import DriverSearchContainer from "../components/compare/DriverSearchContainer";

const SECTION_ORDER = [
  "menu",
  "compare-back",
  "compare-search",
  "compare-chart",
  "footer",
];

function CompareDriversContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("CompareDrivers");

  useEffect(() => {
    document.title = t("tab");
  }, [t]);

  const [selectedDrivers, setSelectedDrivers] = useState<DriverBasicDto[]>([]);
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
        // Użycie nowej akcji serwerowej do zbiorczego pobrania danych kierowców
        const driversInfo = await getDriversBasicInfoAction(guids);

        if (!active) return;

        // Mapowanie wyników – w przypadku braku danych dla podanego GUID tworzymy fallback
        const loadedMap = new Map(driversInfo.map((d) => [d.guid, d]));
        const finalDrivers: DriverBasicDto[] = guids.map((guid) => {
          const found = loadedMap.get(guid);
          if (found) return found;
          return {
            guid,
            mainName: `${t("driverFallback")} (${guid.substring(0, 5)})`,
            currentRating: 0,
          };
        });

        setSelectedDrivers(finalDrivers);
      } catch (err) {
        console.error("Error fetching initial drivers for comparison:", err);
      }
    }

    fetchInitialDrivers();

    return () => {
      active = false;
    };
  }, [searchParams, t]);

  const updateUrlParams = (drivers: DriverBasicDto[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (drivers.length > 0) {
      const guids = drivers.map((d) => d.guid).join(",");
      params.set("guids", guids);
    } else {
      params.delete("guids");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleAddDriver = (driver: DriverBasicDto) => {
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
    <div className="pt-10 pb-4 px-4 sm:px-6 lg:px-8 bg-[var(--color-brand-navy)] text-[var(--color-brand-text)] transition-colors duration-300">
      <div className="container mx-auto max-w-5xl">
        
        {/* SEKCJA: Przycisk Powrotu & Tytuł */}
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
            <h1 className="!text-page-title uppercase leading-tight shrink-0 flex items-center gap-3 text-[var(--color-brand-text)]">
              {/* Natywna ikona SVG zastępująca MUI GroupIcon */}
              <svg
                className="w-[1.15em] h-[1.15em] text-[var(--color-brand-yellow-hover)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {t("title")}
            </h1>
            <p className="text-xs mt-1 !font-sans text-[var(--color-brand-text-muted)]">
              {t("subtitle")}
            </p>
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

        {/* SEKCJA: Wykres Ratingu / Stan Pusty */}
        <div data-section="compare-chart">
          {selectedGuids.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-[var(--color-brand-navy-light)] rounded-[var(--radius-brand-card)] bg-[color-mix(in_srgb,var(--color-brand-navy-dark)_40%,transparent)]">
              <p className="!text-btn-mono uppercase font-bold tracking-wider text-[var(--color-brand-text-muted)]">
                {t("emptyState.title")}
              </p>
              <p className="text-xs mt-1 opacity-70 !font-sans text-[var(--color-brand-text-muted)]">
                {t("emptyState.description")}
              </p>
            </div>
          ) : (
            <RatingChart
              data-focus-order="compare-chart"
              guids={selectedGuids}
              isComparable={false}
              onNavigateVertical={(direction) => {
                focusFlatSection("compare-chart", direction === "up" ? "prev" : "next", SECTION_ORDER);
              }}
            />
          )}
        </div>

      </div>
    </div>
  );
}

export default function DriversComparisonView() {
  const t = useTranslations("CompareDrivers");

  return (
    <PageLoaderWrapper loadingText={t("loadingText")}>
      <CompareDriversContent />
    </PageLoaderWrapper>
  );
}