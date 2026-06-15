"use client";

import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

export default function DebugThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const htmlEl = document.documentElement;
    const currentScheme = htmlEl.getAttribute('data-mui-color-scheme');
    setIsDark(currentScheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const htmlEl = document.documentElement;
    const nextTheme = isDark ? 'light' : 'dark';
    
    // 1. Dodajemy klasę aktywującą płynne przejście kolorów dla MUI i Tailwinda
    htmlEl.classList.add('theme-toggling');
    
    // 2. Zmieniamy atrybut motywu
    htmlEl.setAttribute('data-mui-color-scheme', nextTheme);
    setIsDark(!isDark);

    // 3. Po zakończeniu tranzycji (300ms) usuwamy klasę, odblokowując animacje hover
    setTimeout(() => {
      htmlEl.classList.remove('theme-toggling');
    }, 300);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] shadow-lg rounded-xl overflow-hidden border border-[var(--color-brand-navy-light)]">
      <Button
        variant="contained"
        onClick={toggleTheme}
        startIcon={isDark ? <LightModeIcon /> : <DarkModeIcon />}
        className="bg-[var(--color-brand-yellow)] text-[var(--color-brand-navy-dark)] font-bold hover:bg-[var(--color-brand-yellow-hover)] px-4 py-2 text-xs uppercase tracking-wider"
        sx={{
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