"use client";

import React, { useEffect, useState } from 'react';
import { IconButton, Box } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const htmlEl = document.documentElement;
    const currentScheme = htmlEl.getAttribute('data-mui-color-scheme');
    setIsDark(currentScheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const htmlEl = document.documentElement;
    const nextTheme = isDark ? 'light' : 'dark';
    
    htmlEl.classList.add('theme-toggling');
    htmlEl.setAttribute('data-mui-color-scheme', nextTheme);
    setIsDark(!isDark);

    setTimeout(() => {
      htmlEl.classList.remove('theme-toggling');
    }, 300);
  };

  return (
    /* Kontener wyrównujący przełącznik w pionie, pasujący do struktury AppBar */
    <Box className="flex items-center gap-1">
      {/* IKONA SŁOŃCA (Tryb Jasny) */}
      <IconButton
        size="small"
        onClick={toggleTheme}
        disabled={!isDark}
        className={`transition-all duration-200 
          ${!isDark 
            ? '!text-[var(--color-brand-yellow)] bg-[color-mix(in_srgb,var(--color-brand-yellow)_15%,transparent)]' 
            : '!text-[var(--color-brand-text-muted)] opacity-50 hover:opacity-100'
          }`}
      >
        <LightModeIcon fontSize="small" />
      </IconButton>

      {/* Wizualny mini-suwak (Track) łączący ikony */}
      <div 
        onClick={toggleTheme}
        className="w-8 h-4 rounded-full bg-[var(--color-brand-navy-light)] relative cursor-pointer hidden sm:block transition-all duration-200"
      >
        {/* Pigułka/Kropka suwaka skacząca lewo/prawo */}
        <div 
          className={`w-3 h-3 rounded-full bg-[var(--color-brand-yellow)] absolute top-[2px] transition-all duration-200
            ${isDark ? 'left-[18px]' : 'left-[2px]'}`}
        />
      </div>

      {/* IKONA KSIĘŻYCA (Tryb Ciemny) */}
      <IconButton
        size="small"
        onClick={toggleTheme}
        disabled={isDark}
        className={`transition-all duration-200 
          ${isDark 
            ? '!text-[var(--color-brand-yellow)] bg-[color-mix(in_srgb,var(--color-brand-yellow)_15%,transparent)]' 
            : '!text-[var(--color-brand-text-muted)] opacity-50 hover:opacity-100'
          }`}
      >
        <DarkModeIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}