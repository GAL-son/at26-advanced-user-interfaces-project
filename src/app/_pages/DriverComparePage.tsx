"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Box, Paper, IconButton } from "@mui/material";
import UniversalSearch from "@/app/_components/UniversalSearch";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupIcon from "@mui/icons-material/Group";

import LoadingSpinner from "@/app/_components/LoadingSpinner";
import EloChart from "@/app/_components/Elo/EloChart";
import SelectedDriversList, { DriverBasicInfo } from "@/app/_components/Elo/SelectedDriverList";

function CompareDriversContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedDrivers, setSelectedDrivers] = useState<DriverBasicInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DriverBasicInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const guidsParam = searchParams.get("guids");
    if (!guidsParam) return;

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
          return { guid, mainName: `Driver (${guid.substring(0, 5)})` };
        });

        const drivers = await Promise.all(promises);
        setSelectedDrivers(drivers);
      } catch (err) {
        console.error("Error fetching initial drivers for comparison:", err);
      }
    }

    fetchInitialDrivers();
  }, [searchParams]);

  const updateUrlParams = (drivers: DriverBasicInfo[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (drivers.length > 0) {
      const guids = drivers.map((d) => d.guid).join(",");
      params.set("guids", guids);
    } else {
      params.delete("guids");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddDriver = (driver: DriverBasicInfo) => {
    if (selectedDrivers.some((d) => d.guid === driver.guid)) {
      setIsDropdownOpen(false);
      setSearchQuery("");
      return;
    }
    const updated = [...selectedDrivers, driver];
    setSelectedDrivers(updated);
    updateUrlParams(updated);
    setSearchQuery("");
    setIsDropdownOpen(false);
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
        {/* NAGŁÓWEK */}
        <div className="flex items-center gap-4 mb-8">
          <IconButton
            onClick={() => router.back()}
            sx={{
              border: '1px solid var(--color-brand-navy-light)',
              color: 'var(--color-brand-text-muted)',
              backgroundColor: 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'color-mix(in srgb, var(--color-brand-text) 8%, transparent)',
                borderColor: 'var(--color-brand-text-muted)'
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <div>
            <h1 
              className="text-3xl font-black uppercase tracking-tight leading-tight flex items-center gap-3"
              style={{ color: 'var(--color-brand-text)' }}
            >
              <GroupIcon fontSize="large" sx={{ color: 'var(--color-brand-yellow-hover)' }} />{" "}
              Telemetry Comparison
            </h1>
            <p 
              className="text-xs mt-1"
              style={{ color: 'var(--color-brand-text-muted)' }}
            >
              Compare multiple drivers' ELO performance over time
            </p>
          </div>
        </div>

        {/* WYSZUKIWARKA I PANEL KONTROLNY */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <Paper
            elevation={0}
            className="p-6"
            sx={{ 
              backgroundImage: "none",
              backgroundColor: "var(--color-brand-navy-dark)",
              border: "1px solid var(--color-brand-navy-light)",
              borderRadius: "var(--radius-brand-card)",
              transition: 'background-color 0.3s ease, border-color 0.3s ease'
            }}
          >
            <div className="w-full">
              <p 
                className="text-[10px] font-mono uppercase tracking-widest font-bold mb-2"
                style={{ color: 'var(--color-brand-text-muted)', opacity: 0.8 }}
              >
                Search & Add Drivers
              </p>

              <UniversalSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Type driver name..."
                isLoading={isSearching}
                results={searchResults}
                onSelectResult={handleAddDriver}
              />
            </div>

            <SelectedDriversList
              drivers={selectedDrivers} 
              onRemove={handleRemoveDriver} 
            />
          </Paper>
        </div>

        {/* SEKCJA WYKRESU ELO / STAN PUSTY */}
        {selectedGuids.length === 0 ? (
          <Box 
            className="h-64 flex flex-col items-center justify-center p-6 text-center"
            sx={{
              border: '2px dashed var(--color-brand-navy-light)',
              borderRadius: 'var(--radius-brand-card)',
              backgroundColor: 'color-mix(in srgb, var(--color-brand-navy-dark) 40%, transparent)',
            }}
          >
            <p 
              className="text-sm font-mono font-bold tracking-wider"
              style={{ color: 'var(--color-brand-text-muted)' }}
            >
              [AWAITING DATA INPUT]
            </p>
            <p 
              className="text-xs mt-1"
              style={{ color: 'var(--color-brand-text-muted)', opacity: 0.7 }}
            >
              Select at least one driver to mount the ELO tracking module.
            </p>
          </Box>
        ) : (
          <EloChart guids={selectedGuids} />
        )}
      </div>
    </Box>
  );
}

export default function CompareDriversPage() {
  return (
    <Suspense
      fallback={
        <Box 
          className="min-h-screen flex flex-col items-center justify-center gap-3"
          sx={{ backgroundColor: 'var(--color-brand-navy)' }}
        >
          <LoadingSpinner
            text="Initializing multi-node tracking..."
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