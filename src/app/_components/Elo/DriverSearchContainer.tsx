"use client";

import React, { useState, useEffect } from "react";
import { Paper } from "@mui/material";
import UniversalSearch from "@/app/_components/UniversalSearch";
import SearchDriverItem from "@/app/_components/Elo/SearchDriverItem";
import SelectedDriversList, { DriverBasicInfo } from "@/app/_components/Elo/SelectedDriverList";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DriverBasicInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
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
        if (data.success && Array.isArray(data.results)) {
          setSearchResults(data.results);
        }
      } catch (err) {
        console.error("Error searching drivers:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelect = (driver: DriverBasicInfo) => {
    onAddDriver(driver);
    setSearchQuery("");
  };

  return (
    <Paper
      elevation={0}
      className="p-4 sm:p-6" // Mniejszy padding na mobile
      sx={{
        backgroundImage: "none",
        backgroundColor: "var(--color-brand-navy-dark)",
        border: "1px solid var(--color-brand-navy-light)",
        borderRadius: "var(--radius-brand-card)",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* 🚀 RESPONSYWNY GRID: 1 kolumna na mobile, 2 kolumny na desktopie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* LEWA STRONA: Wyszukiwarka */}
        <div className="w-full">
          <p
            className="text-[10px] font-mono uppercase tracking-widest font-bold mb-2"
            style={{ color: "var(--color-brand-text-muted)", opacity: 0.8 }}
          >
            Search & Add Drivers
          </p>

          <UniversalSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Type driver name..."
            isLoading={isSearching}
            results={searchResults}
            onSelectResult={handleSelect}
            renderItem={SearchDriverItem}
          />
        </div>

        {/* PRAWA STRONA: Wybrani kierowcy (na mobile wskoczy pod spód) */}
        <div className="w-full md:mt-0">
          <SelectedDriversList 
            drivers={selectedDrivers} 
            onRemove={onRemoveDriver} 
          />
        </div>
        
      </div>
    </Paper>
  );
}