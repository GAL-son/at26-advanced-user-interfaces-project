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
}

export default function DriverSearchContainer({
  selectedDrivers,
  onAddDriver,
  onRemoveDriver,
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

  // Dynamiczny komunikat dla czytników ekranu (WCAG Status Messages - Kryterium 4.1.3)
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
      {/* Sekcja ukryta wizualnie, ale dostępna dla czytników (Aria Live Region) */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {getSearchStatusMessage()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* LEWA STRONA: Wyszukiwarka */}
        <div className="w-full">
          <Box 
            component="p"
            className="text-[10px] font-mono uppercase tracking-widest font-bold mb-2 opacity-80"
            sx={{ color: "var(--color-brand-text-muted)" }}
          >
            {t("label")}
          </Box>

          <UniversalSearch
            value={searchQuery}
            onChange={setSearchQuery}
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
          />
        </div>
        
      </div>
    </Paper>
  );
}