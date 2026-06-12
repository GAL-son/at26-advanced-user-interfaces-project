"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Paper, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

import LoadingSpinner from "@/app/_components/LoadingSpinner";
import EloChart from "@/app/_components/Elo/EloChart";

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

  // EKRAN ŁADOWANIA WSTĘPNEGO
  if (loadingProfile) {
    return (
      <Box 
        className="min-h-screen flex flex-col items-center justify-center gap-3"
        sx={{ backgroundColor: 'var(--color-brand-navy)' }}
      >
        <LoadingSpinner text="Establishing baseline telemetry..." size={20} className="py-2 px-4" />
      </Box>
    );
  }

  // BŁĄD POŁĄCZENIA
  if (!driver) {
    return (
      <Box 
        className="min-h-screen flex items-center justify-center font-mono text-sm"
        sx={{ backgroundColor: 'var(--color-brand-navy)', color: 'var(--color-brand-text-muted)' }}
      >
        [ERROR]: Driver profile connection timed out.
      </Box>
    );
  }

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
        
        {/* NAGŁÓWEK / POWRÓT */}
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
              className="text-3xl font-black uppercase tracking-tight leading-tight"
              style={{ color: 'var(--color-brand-text)' }}
            >
              {driver.mainName}
            </h1>
            {driver.altNames && (
              <p 
                className="text-xs mt-1"
                style={{ color: 'var(--color-brand-text-muted)', opacity: 0.7 }}
              >
                Aliases: {driver.altNames}
              </p>
            )}
          </div>
        </div>

        {/* STATYSTYKI - KARTY HUD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          {/* KARTA 1: CURRENT ELO */}
          <Paper 
            component={Box} 
            className="p-5 flex items-center gap-4 shadow-sm" 
            sx={{ 
              backgroundImage: 'none',
              backgroundColor: 'var(--color-brand-navy-dark)',
              border: '1px solid var(--color-brand-navy-light)',
              borderRadius: 'var(--radius-brand-card)'
            }}
          >
            <Box 
              className="p-3 rounded-lg flex-shrink-0"
              sx={{ 
                backgroundColor: 'color-mix(in srgb, var(--color-brand-yellow-hover) 12%, transparent)',
                color: 'var(--color-brand-yellow-hover)'
              }}
            >
              <TrendingUpIcon fontSize="large" />
            </Box>
            <div>
              <p 
                className="text-[10px] font-mono uppercase tracking-widest font-bold"
                style={{ color: 'var(--color-brand-text-muted)', opacity: 0.7 }}
              >
                Current ELO
              </p>
              <h3 
                className="text-2xl font-black font-mono"
                style={{ color: 'var(--color-brand-text)' }}
              >
                {driver.currentElo}
              </h3>
            </div>
          </Paper>

          {/* KARTA 2: TOTAL EXPERIENCE */}
          <Paper 
            component={Box} 
            className="p-5 flex items-center gap-4 shadow-sm" 
            sx={{ 
              backgroundImage: 'none',
              backgroundColor: 'var(--color-brand-navy-dark)',
              border: '1px solid var(--color-brand-navy-light)',
              borderRadius: 'var(--radius-brand-card)'
            }}
          >
            <Box 
              className="p-3 rounded-lg flex-shrink-0"
              sx={{ 
                backgroundColor: 'color-mix(in srgb, var(--color-brand-text) 6%, transparent)',
                color: 'var(--color-brand-text-muted)'
              }}
            >
              <SportsScoreIcon fontSize="large" />
            </Box>
            <div>
              <p 
                className="text-[10px] font-mono uppercase tracking-widest font-bold"
                style={{ color: 'var(--color-brand-text-muted)', opacity: 0.7 }}
              >
                Total Experience
              </p>
              <h3 
                className="text-2xl font-black font-mono"
                style={{ color: 'var(--color-brand-text)' }}
              >
                {driver.racesCount}{" "}
                <span className="text-xs font-normal" style={{ color: 'var(--color-brand-text-muted)' }}>
                  races
                </span>
              </h3>
            </div>
          </Paper>

          {/* KARTA 3: LAST ONLINE SYNC */}
          <Paper 
            component={Box} 
            className="p-5 flex items-center gap-4 shadow-sm" 
            sx={{ 
              backgroundImage: 'none',
              backgroundColor: 'var(--color-brand-navy-dark)',
              border: '1px solid var(--color-brand-navy-light)',
              borderRadius: 'var(--radius-brand-card)'
            }}
          >
            <Box 
              className="p-3 rounded-lg flex-shrink-0"
              sx={{ 
                backgroundColor: 'var(--color-brand-navy-light)',
                color: 'var(--color-brand-text-muted)'
              }}
            >
              <EventAvailableIcon fontSize="large" />
            </Box>
            <div>
              <p 
                className="text-[10px] font-mono uppercase tracking-widest font-bold"
                style={{ color: 'var(--color-brand-text-muted)', opacity: 0.7 }}
              >
                Last Online Sync
              </p>
              <h3 
                className="text-sm font-bold mt-1"
                style={{ color: 'var(--color-brand-text)' }}
              >
                {new Date(driver.lastRaced).toLocaleDateString("en-US", {
                  day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                })}
              </h3>
            </div>
          </Paper>
        </div>

        {/* ASYNCHRONICZNY WYKRES ELO KIEROWCY Z PARAMETREM PORÓWNANIA */}
        <EloChart guids={[guid]} isComparable={true} />

      </div>
    </Box>
  );
}