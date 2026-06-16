"use client";

import React, { useEffect, useState } from 'react';
import { IconButton, Box } from '@mui/material';
import { useColorScheme } from '@mui/material/styles'; // Import hooka z MUI v6
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

interface ThemeToggleProps {
  focusableRef?: (el: HTMLElement | null) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
}

export default function ThemeToggle({ focusableRef, onKeyDown }: ThemeToggleProps) {
  // 1. Wyciągamy mode (aktualny motyw) oraz setMode z MUI
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = useState(false);

  // Zapobiegamy błędom hydracji (MUI potrzebuje chwili na odczytanie localStorage po stronie klienta)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !mode) {
    // Możesz tu zwrócić pusty placeholder o takich samych wymiarach, aby layout nie skakał
    return <Box className="w-[88px] h-8" />;
  }

  const isDark = mode === 'dark';

  const toggleTheme = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  const handleSelfKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTheme();
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <Box
      ref={focusableRef}
      tabIndex={-1}
      onKeyDown={handleSelfKeyDown}
      onClick={toggleTheme}
      role="button"
      aria-label="Toggle theme"
      className="flex items-center gap-1 focus-brand rounded-md p-0.5 cursor-pointer outline-none"
    >
      {/* IKONA SŁOŃCA */}
      <IconButton
        size="small"
        tabIndex={-1}
        focusable="false"
        aria-hidden="true"
        sx={{ pointerEvents: 'none' }}
        className={`transition-all duration-200 
          ${!isDark
            ? '!text-[var(--color-brand-yellow)] bg-[color-mix(in_srgb,var(--color-brand-yellow)_15%,transparent)]'
            : '!text-[var(--color-brand-text-muted)] opacity-50'
          }`}
      >
        <LightModeIcon fontSize="small" />
      </IconButton>

      {/* Wizualny mini-suwak */}
      <div className="w-8 h-4 rounded-full bg-[var(--color-brand-navy-light)] relative hidden sm:block transition-all duration-200">
        <div
          className={`w-3 h-3 rounded-full bg-[var(--color-brand-yellow)] absolute top-[2px] transition-all duration-200
            ${isDark ? 'left-[18px]' : 'left-[2px]'}`}
        />
      </div>

      {/* IKONA KSIĘŻYCA */}
      <IconButton
        size="small"
        tabIndex={-1}
        focusable="false"
        aria-hidden="true"
        sx={{ pointerEvents: 'none' }}
        className={`transition-all duration-200 
          ${isDark
            ? '!text-[var(--color-brand-yellow)] bg-[color-mix(in_srgb,var(--color-brand-yellow)_15%,transparent)]'
            : '!text-[var(--color-brand-text-muted)] opacity-50'
          }`}
      >
        <DarkModeIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}