"use client";

import React from "react";
import { Box } from "@mui/material";

// Definiujemy lekki, dedykowany interfejs dla tej konkretnej, szybkiej wyszukiwarki
interface FastSearchDriver {
  guid: string;
  mainName: string;
  currentElo?: number; // Opcjonalne, bo zależy nam na prędkości i mniejszej ilości danych
}

interface SearchDriverItemProps {
  item: FastSearchDriver;
}

export default function SearchDriverItem({ item }: SearchDriverItemProps) {
  return (
    <Box 
      sx={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        width: "100%",
        gap: 2,
        transition: "color 0.3s ease"
      }}
    >
      {/* Główna nazwa użytkownika */}
      <Box 
        component="span"
        className="font-bold uppercase tracking-wide text-xs sm:text-sm truncate pr-2"
        sx={{ color: "var(--color-brand-text)" }}
        title={item.mainName}
      >
        {item.mainName}
      </Box>

      {/* Sekcja ELO - renderuje się tylko, jeśli API je zwróciło w szybkim pakiecie danych */}
      {item.currentElo !== undefined && (
        <Box 
          component="span"
          className="text-[10px] sm:text-xs font-mono font-black px-2 py-0.5 rounded-md whitespace-nowrap flex-shrink-0"
          sx={{ 
            color: "var(--color-brand-yellow-text)",
            backgroundColor: "color-mix(in srgb, var(--color-brand-yellow) 12%, transparent)"
          }}
        >
          ELO: {Math.round(item.currentElo)}
        </Box>
      )}
    </Box>
  );
}