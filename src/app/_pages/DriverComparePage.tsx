"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Box, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupIcon from "@mui/icons-material/Group";

// Import nowego kontenera wyszukiwania
import DriverSearchContainer from "@/app/_components/Elo/DriverSearchContainer";

import LoadingSpinner from "@/app/_components/LoadingSpinner";
import EloChart from "@/app/_components/Elo/EloChart";
import { DriverBasicInfo } from "@/app/_components/Elo/SelectedDriverList";

function CompareDriversContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedDrivers, setSelectedDrivers] = useState<DriverBasicInfo[]>([]);

  // Pobieranie początkowych kierowców z URL params
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

  // Synchronizacja stanu z URL params
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

        {/* WYSZUKIWARKA I PANEL KONTROLNY (TERAZ JAKO JEDEN KOMPONENT) */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <DriverSearchContainer
            selectedDrivers={selectedDrivers}
            onAddDriver={handleAddDriver}
            onRemoveDriver={handleRemoveDriver}
          />
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