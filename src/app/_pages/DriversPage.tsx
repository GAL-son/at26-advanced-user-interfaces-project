"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import DriverFilterBar from "@/app/_components/Drivers/DriverFilterBar";
import DriverList from "@/app/_components/Drivers/DriverList";
import { FormattedDriver } from "@/app/_components/Drivers/DriverRow";
import { focusFlatSection } from "@/app/_utils/navigation";
import { usePageInitialFocus } from "../_hooks/usePageInitialFocus";
import { DriverSortOption } from "@/lib/services/drivers.service";

const SECTION_ORDER = ["menu", "drivers-filters", "drivers-list", "footer"];

interface DriversPageProps {
  initialDrivers: FormattedDriver[];
  initialHasMore: boolean;
}

export default function DriversPage({
  initialDrivers = [],
  initialHasMore = true,
}: DriversPageProps) {
  const t = useTranslations("Drivers");

  useEffect(() => {
    document.title = t("tab");
  }, [t]);

  usePageInitialFocus();

  // Stan dla filtrowania i sortowania
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<DriverSortOption>("RATING_DESC");

  // Debounce zapytania wyszukiwania (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <main
      id="main-content"
      className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[var(--color-brand-navy)] text-[var(--color-brand-text)]"
    >
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-page-title uppercase mb-6 text-[var(--color-brand-text)]">
          {t("title")}
        </h1>

        {/* Sekcja filtrów */}
        <div
          data-section="drivers-filters"
          data-section-page-start="true"
          className="w-full"
        >
          <DriverFilterBar
            search={search}
            setSearch={setSearch}
            sortBy={sortBy as any}
            setSortBy={(val) => setSortBy(val as DriverSortOption)}
            onNavigateVertical={(dir) =>
              focusFlatSection("drivers-filters", dir, SECTION_ORDER)
            }
          />
        </div>

        {/* Sekcja tabeli/listy kierowców */}
        <div data-section="drivers-list" className="w-full mt-4">
          <DriverList
            key={`${debouncedSearch}-${sortBy}`} // Re-mount przy zmianie filtrów
            initialDrivers={initialDrivers}
            initialHasMore={initialHasMore}
            searchQuery={debouncedSearch}
            sortBy={sortBy}
            limit={20}
          />
        </div>
      </div>
    </main>
  );
}