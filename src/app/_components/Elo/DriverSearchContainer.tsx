"use client";

import React, { useState, useEffect } from "react";
import { Paper, Box } from "@mui/material";
import UniversalSearch from "@/app/_components/UniversalSearch";
import SearchDriverItem from "@/app/_components/Elo/SearchDriverItem";
import SelectedDriversList, { DriverBasicInfo } from "@/app/_components/Elo/SelectedDriverList";
import { useTranslations } from "next-intl";

interface DriverSearchContainerProps {
  selectedDrivers: DriverBasicInfo[];
  onAddDriver: (driver: DriverBasicInfo) => void;
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
  const [searchResults, setSearchResults] = useState<DriverBasicInfo[]>([]);
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
        const res = await fetch(
          `/api/drivers/search?q=${encodeURIComponent(searchQuery)}`,
        );
        const data = await res.json();

        if (active && data.success && Array.isArray(data.results)) {
          setSearchResults(data.results);
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

  const handleSelect = (driver: DriverBasicInfo) => {
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
    <Paper
      elevation={0}
      className="p-4 sm:p-6"
      sx={{
        backgroundImage: "none",
        backgroundColor: "var(--color-brand-navy-dark)",
        border: "1px solid var(--color-brand-navy-light)",
        borderRadius: "var(--radius-brand-card)",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {getSearchStatusMessage()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        {/* LEWA STRONA: Wyszukiwarka */}
        <div className="w-full">
          {/* POPRAWKA: Przejście z surowych klas rozmiaru na token !text-btn-mono z wagą czcionki i trackingiem */}
          <p 
            className="!text-btn-mono uppercase tracking-widest font-bold mb-2 opacity-80"
            style={{ color: "var(--color-brand-text-muted)" }}
          >
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
    </Paper>
  );
}