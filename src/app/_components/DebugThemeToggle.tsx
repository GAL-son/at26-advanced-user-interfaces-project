"use client";

import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

export default function DebugThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Sprawdzamy początkowy stan prosto z drzewa DOM
    const htmlEl = document.documentElement;
    const currentScheme = htmlEl.getAttribute('data-mui-color-scheme');
    setIsDark(currentScheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const htmlEl = document.documentElement;
    const nextTheme = isDark ? 'light' : 'dark';
    
    // Zmieniamy atrybut, na który reaguje zarówno MUI, jak i nasz Tailwind v4
    htmlEl.setAttribute('data-mui-color-scheme', nextTheme);
    setIsDark(!isDark);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] shadow-lg rounded-xl overflow-hidden border border-brand-navy-light">
      <Button
        variant="contained"
        onClick={toggleTheme}
        startIcon={isDark ? <LightModeIcon /> : <DarkModeIcon />}
        className="bg-brand-yellow text-brand-navy-dark font-bold hover:bg-brand-yellow-hover px-4 py-2 text-xs uppercase tracking-wider"
        sx={{
          // Stylowanie awaryjne MUI, jeśli Tailwind ładowałby się ułamek sekundy później
          backgroundColor: 'var(--color-brand-yellow) !important',
          color: 'var(--color-brand-navy-dark) !important',
          fontFamily: 'monospace',
        }}
      >
        Motyw: {isDark ? 'Jasny' : 'Ciemny'} (Debug)
      </Button>
    </div>
  );
}