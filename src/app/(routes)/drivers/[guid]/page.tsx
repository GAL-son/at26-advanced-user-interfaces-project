"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Paper, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

import LoadingSpinner from "@/app/_components/LoadingSpinner";
import EloChart from "./EloChart";

interface DriverStats {
  guid: string;
  mainName: string;
  altNames: string | null;
  combo: number;
  currentElo: number;
  racesCount: number;
  lastRaced: string;
}

export default function DriverProfilePage() {
  const { guid } = useParams() as { guid: string };
  const router = useRouter();

  const [driver, setDriver] = useState<DriverStats | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Pobranie wyłącznie podstawowych danych profilu (błyskawiczne zapytanie)
  useEffect(() => {
    async function fetchDriverProfile() {
      try {
        const res = await fetch(`/api/drivers/${guid}`);
        const data = await res.json();
        if (data.success) {
          setDriver(data.driver);
        }
      } catch (err) {
        console.error("Error fetching driver profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchDriverProfile();
  }, [guid]);

  // Główny loader strony (widoczny tylko przez ułamek sekundy na pobranie metadanych)
  if (loadingProfile) {
    return (
      <Box className="min-h-screen bg-brand-navy flex flex-col items-center justify-center gap-3">
        <LoadingSpinner text="Establishing baseline telemetry..." size={20} className="py-2 px-4" />
      </Box>
    );
  }

  if (!driver) {
    return (
      <Box className="min-h-screen bg-brand-navy flex items-center justify-center text-brand-muted font-mono text-sm">
        [ERROR]: Driver profile connection timed out.
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-brand-navy py-10 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="container mx-auto max-w-5xl">
        
        {/* NAGŁÓWEK / POWRÓT */}
        <div className="flex items-center gap-4 mb-8">
          <IconButton 
            onClick={() => router.back()} 
            className="!border !border-brand-navy-light !text-brand-muted hover:!bg-brand-navy-light/20"
          >
            <ArrowBackIcon />
          </IconButton>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-brand-muted leading-tight">
              {driver.mainName}
            </h1>
            {driver.altNames && (
              <p className="text-xs text-brand-muted/60 mt-1">Aliases: {driver.altNames}</p>
            )}
          </div>
        </div>

        {/* STATYSTYKI - KARTY HUD (Wyświetlane od razu) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Paper component={Box} className="bg-brand-navy-dark border border-brand-navy-light p-5 rounded-brand-card flex items-center gap-4 shadow-sm" sx={{ backgroundImage: 'none' }}>
            <div className="p-3 bg-brand-yellow/10 rounded-lg text-brand-yellow">
              <TrendingUpIcon fontSize="large" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-brand-muted/60 font-bold">Current ELO</p>
              <h3 className="text-2xl font-black font-mono text-brand-muted">{driver.currentElo}</h3>
            </div>
          </Paper>

          <Paper component={Box} className="bg-brand-navy-dark border border-brand-navy-light p-5 rounded-brand-card flex items-center gap-4 shadow-sm" sx={{ backgroundImage: 'none' }}>
            <div className="p-3 bg-brand-muted/10 rounded-lg text-brand-muted">
              <SportsScoreIcon fontSize="large" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-brand-muted/60 font-bold">Total Experience</p>
              <h3 className="text-2xl font-black font-mono text-brand-muted">{driver.racesCount} <span className="text-xs font-normal text-brand-muted/60">races</span></h3>
            </div>
          </Paper>

          <Paper component={Box} className="bg-brand-navy-dark border border-brand-navy-light p-5 rounded-brand-card flex items-center gap-4 shadow-sm" sx={{ backgroundImage: 'none' }}>
            <div className="p-3 bg-brand-navy-light text-brand-muted/80 rounded-lg">
              <EventAvailableIcon fontSize="large" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-brand-muted/60 font-bold">Last Online Sync</p>
              <h3 className="text-sm font-bold text-brand-muted mt-1">
                {new Date(driver.lastRaced).toLocaleDateString("en-US", {
                  day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                })}
              </h3>
            </div>
          </Paper>
        </div>

        {/* 🟢 WYDZIELONY KOMPONENT WYKRESU */}
        {/* Działa asynchronicznie, pobiera dane w tle i ma swój dedykowany spinner */}
        <EloChart guids={[guid]} />

      </div>
    </Box>
  );
}