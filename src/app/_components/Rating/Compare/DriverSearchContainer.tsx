"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

import UniversalSearch from "@/app/_components/UniversalSearch";
import SearchDriverItem from "@/app/_components/Rating/Compare/SearchDriverItem";
import SelectedDriversList from "@/app/_components/Rating/Compare/SelectedDriverList";
import { searchDriversAction } from "@/app/_actions/drivers.actions";
import { DriverBasicDto } from "@/lib/services/drivers.service";

interface DriverSearchContainerProps {
  selectedDrivers: DriverBasicDto[];
  onAddDriver: (driver: DriverBasicDto) => void;
  onRemoveDriver: (guid: string) => void;
  onNavigateVertical?: (direction: "up" | "down") => void;
}

export default function DriverSearchContainer({
  selectedDrivers,
  onAddDriver,
  onRemoveDriver,
  onNavigateVertical,
}: DriverSearchContainerProps) {
  const t = useTranslations("CompareDrivers.search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DriverBasicDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    let active = true;

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        // Wywołanie akcji serwerowej zamiast wywołania API
        const results = await searchDriversAction(searchQuery);

        if (active) {
          setSearchResults(results);
        }
      } catch (err) {
        console.error("Error searching drivers:", err);
      } finally {
        if (active) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(delayDebounceFn);
    };
  }, [searchQuery]);

  const handleSelect = (driver: DriverBasicDto) => {
    onAddDriver(driver);
    setSearchQuery("");
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowUp" && onNavigateVertical) {
      e.preventDefault();
      onNavigateVertical("up");
    }

    if (e.key === "ArrowDown" && onNavigateVertical) {
      e.preventDefault();
      onNavigateVertical("down");
    }

    if (e.key === "ArrowRight") {
      const firstChip = document.getElementById("selected-driver-chip-0");
      if (firstChip) {
        e.preventDefault();
        firstChip.focus();
      }
    }
  };

  const getSearchStatusMessage = () => {
    if (isSearching) return t("statusSearching");
    if (searchQuery && searchResults.length === 0) return t("statusNoResults");
    if (searchResults.length > 0) {
      return t("statusFoundResults", {
        count: searchResults.length
      });
    }
    return "";
  };

  return (
    <div className="p-4 sm:p-6 bg-[var(--color-brand-navy-dark)] border border-[var(--color-brand-navy-light)] rounded-[var(--radius-brand-card)] transition-colors duration-300">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {getSearchStatusMessage()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* LEWA STRONA: Wyszukiwarka */}
        <div className="w-full">
          <p className="!text-btn-mono uppercase tracking-widest font-bold mb-2 opacity-80 text-[var(--color-brand-text-muted)]">
            {t("label")}
          </p>

          <UniversalSearch
            id="driver-search-input"
            data-focus-order="primary"
            value={searchQuery}
            onChange={setSearchQuery}
            onKeyDown={handleSearchKeyDown}
            placeholder={t("placeholder")}
            isLoading={isSearching}
            results={searchResults}
            onSelectResult={handleSelect}
            renderItem={SearchDriverItem}
          />
        </div>

        {/* PRAWA STRONA: Wybrani kierowcy */}
        <div className="w-full">
          <SelectedDriversList
            drivers={selectedDrivers}
            onRemove={onRemoveDriver}
            onNavigateVertical={onNavigateVertical}
          />
        </div>
      </div>
    </div>
  );
}